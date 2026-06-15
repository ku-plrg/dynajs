import { execFileSync } from 'node:child_process';
import { FlowAnalysis, type Valued, type InfoDomain, type CallPolicy } from '@/model/index.js';
import { type Sym, type Sort, UnsupportedSym, symToString } from '@shared/sym.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

installPrelude();

// A branch actually taken during concrete execution: `constraint` is the
// symbolic form of the condition, `taken` whether it was truthy. Together these
// form the path condition leading up to a __symbolic_assert__.
type PathConstraint = { id: number; constraint: Sym; taken: boolean };

// ---------------------------------------------------------------------------
// SMT-LIB translation
//
// Scope: integer arithmetic, comparisons, boolean logic, and a slice of the z3
// String theory — string equality, concatenation (`str.++`), fixed-window
// substring/char-access (`str.substr`), and length (`str.len`) — enough for the
// concolic microbenches. Operators outside this set (bitwise, **, string
// ordering `< > <= >=`, ...) throw `UnsupportedSym`; symbolicAssert turns that
// into an `error` verdict rather than silently mis-translating.
// (`Sym`/`Sort`/`UnsupportedSym`/`symToString` live in the engine-neutral
// `@shared/sym.js`; only the SMT-LIB translation below is concolic-only.)
// ---------------------------------------------------------------------------

// op -> SMT-LIB builder. Comparisons/arith map almost 1:1; equality and
// inequality need (=)/(not (=)); integer / becomes div. `%` can't reuse SMT's
// `mod`: SMT-LIB `mod` is Euclidean (result always in [0, |b|)), whereas JS `%`
// is truncated (the remainder takes the sign of the *dividend*, so e.g.
// -2 % 3 === -2, not 1). We encode the JS rule as sign(a) * (|a| mod |b|) — the
// truncated remainder — so negative-dividend modulo solves faithfully instead
// of producing a spurious counterexample.
const SMT_BINARY: Record<string, (a: string, b: string) => string> = {
  '===': (a, b) => `(= ${a} ${b})`,
  '==': (a, b) => `(= ${a} ${b})`,
  '!==': (a, b) => `(not (= ${a} ${b}))`,
  '!=': (a, b) => `(not (= ${a} ${b}))`,
  '<': (a, b) => `(< ${a} ${b})`,
  '<=': (a, b) => `(<= ${a} ${b})`,
  '>': (a, b) => `(> ${a} ${b})`,
  '>=': (a, b) => `(>= ${a} ${b})`,
  '+': (a, b) => `(+ ${a} ${b})`,
  '-': (a, b) => `(- ${a} ${b})`,
  '*': (a, b) => `(* ${a} ${b})`,
  '/': (a, b) => `(div ${a} ${b})`,
  '%': (a, b) =>
    `(ite (>= ${a} 0) (mod ${a} (abs ${b})) (- (mod (- ${a}) (abs ${b}))))`,
  '&&': (a, b) => `(and ${a} ${b})`,
  '||': (a, b) => `(or ${a} ${b})`,
};

// SMT-LIB string literal: double quotes, with an embedded `"` escaped as `""`.
function smtString(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

function constToSmt(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value < 0 ? `(- ${-value})` : `${value}`;
  }
  if (typeof value === 'string') return smtString(value);
  throw new UnsupportedSym(`unsupported constant: ${JSON.stringify(value)}`);
}

function symToSmt(s: Sym, vars: Map<string, Sort>): string {
  switch (s.kind) {
    case 'const':
      return constToSmt(s.value);
    case 'var':
      vars.set(s.name, s.sort);
      return s.name;
    case 'unary': {
      const x = symToSmt(s.operand, vars);
      if (s.op === '!') return `(not ${x})`;
      if (s.op === '-') return `(- ${x})`;
      if (s.op === '+') return x;
      throw new UnsupportedSym(`unsupported unary op: ${s.op}`);
    }
    case 'binary': {
      const build = SMT_BINARY[s.op];
      if (!build) throw new UnsupportedSym(`unsupported binary op: ${s.op}`);
      return build(symToSmt(s.left, vars), symToSmt(s.right, vars));
    }
    case 'concat':
      return `(str.++ ${symToSmt(s.left, vars)} ${symToSmt(s.right, vars)})`;
    case 'substr':
      return `(str.substr ${symToSmt(s.src, vars)} ${s.start} ${s.length})`;
    case 'strlen':
      return `(str.len ${symToSmt(s.src, vars)})`;
    case 'truncate':
      // concolic models numbers as Int, so truncate-toward-zero is identity.
      return symToSmt(s.src, vars);
  }
}

// Ask z3 whether `assertSym` necessarily holds under the path condition `pc`,
// by checking `pc ∧ ¬assert` for satisfiability:
//   unsat -> "valid"   (no counterexample: assert always holds)
//   sat   -> "invalid" (a model violates the assert)
//   else  -> "unknown"
function solveValidity(
  pc: PathConstraint[],
  assertSym: Sym,
): 'valid' | 'invalid' | 'unknown' {
  const vars = new Map<string, Sort>();
  const lines: string[] = [];
  for (const p of pc) {
    const c = symToSmt(p.constraint, vars);
    lines.push(`(assert ${p.taken ? c : `(not ${c})`})`);
  }
  lines.push(`(assert (not ${symToSmt(assertSym, vars)}))`);

  // The String theory needs an explicit logic; the all-Int path stays bare so
  // existing integer benches translate byte-for-byte as before.
  const hasString = [...vars.values()].includes('String');
  const smt =
    (hasString ? '(set-logic ALL)\n' : '') +
    [...vars].map(([v, sort]) => `(declare-const ${v} ${sort})`).join('\n') +
    '\n' +
    lines.join('\n') +
    '\n(check-sat)\n';

  let out: string;
  try {
    out = execFileSync('z3', ['-in'], { input: smt, encoding: 'utf8' }).trim();
  } catch (e) {
    throw new UnsupportedSym(`z3 invocation failed: ${(e as Error).message}`);
  }
  if (out.startsWith('unsat')) return 'valid';
  if (out.startsWith('sat')) return 'invalid';
  return 'unknown';
}

// ---------------------------------------------------------------------------

// We build on FlowAnalysis purely for its identity-based wrapping: every value
// (incl. primitives) is a uniquely-wrapped object tracked by symbol id, so two
// distinct literal `2`s are distinct entries — no value-keyed aliasing. The
// symbolic expression for a value is stored as its `Info` (= Sym), built up
// purely through the op-aware Info hooks (binaryInfo/unaryInfo/lengthInfo/
// substringInfo/concatenateInfo/truncateInfo/conditionInfo) — no `Analysis`
// method overrides, no frame types. Both user-code ops (via the instrumenter)
// and model/polyfill ops (via `$`) funnel through these same hooks.
export class ConcolicAnalysis extends FlowAnalysis<Sym | undefined> {
  result: unknown;
  private pathConstraints: PathConstraint[] = [];

  static OPAQUE_CALLS = new Set<unknown>([console.log]);

  domain: InfoDomain<Sym | undefined> = {
    getBottom: () => undefined,
    isBottom: (info): info is undefined => info === undefined,
  };

  policy: CallPolicy = {
    isOpaque: (f) => ConcolicAnalysis.OPAQUE_CALLS.has(f),
  };

  // baseInfo is operator-unaware (it can't tell `.length` from any other field
  // read), so concolic builds NO flow-through info here — every symbolic value
  // comes from the op-aware hooks below (the framework routes `.length` to
  // lengthInfo, `s[i]` to substringInfo, etc.). Stays inert.
  protected baseInfo(): Sym | undefined {
    return undefined;
  }

  // The model routes string-builtin results (charAt/slice/substring/...) and the
  // `s[i]` char-access through these hooks, so they DO carry symbolic structure.
  protected substringInfo(
    src: Valued<Sym>,
    start: number,
    resultLength: number,
  ): Sym | undefined {
    // Non-symbolic source -> result has no symbolic dependency.
    if (src.info === undefined) return undefined;
    return { kind: 'substr', src: src.info, start, length: resultLength };
  }

  protected concatenateInfo(
    left: Valued<Sym>,
    _leftLength: number,
    right: Valued<Sym>,
    _rightLength: number,
  ): Sym | undefined {
    // `Valued` carries each side's concrete value, so a non-symbolic side is
    // reconstructed as a string constant (via `symOf`) rather than dropped — the
    // common `sym + "literal"` shape (str.++ s "literal"). Same as binaryInfo: no
    // node when both sides are constant.
    const l = this.symOf(left);
    const r = this.symOf(right);
    if (l.kind === 'const' && r.kind === 'const') return undefined;
    return { kind: 'concat', left: l, right: r };
  }

  // Arithmetic (`+ - * / …`) or ordering comparison (`< <= > >=`), from user code
  // OR a generated model — both funnel here. Build the operator Sym; a
  // non-symbolic side keeps its constant via `symOf`, two constants -> no node
  // (keeps it out of the path condition). A `+` reaching here is numeric — string
  // `+` is split to concatenate upstream (applyBinary step 1c / codegen).
  protected binaryInfo(op: string, l: Valued<Sym>, r: Valued<Sym>): Sym | undefined {
    const left = this.symOf(l);
    const right = this.symOf(r);
    if (left.kind === 'const' && right.kind === 'const') return undefined;
    return { kind: 'binary', op, left, right };
  }

  protected unaryInfo(op: string, x: Valued<Sym>): Sym | undefined {
    const operand = this.symOf(x);
    if (operand.kind === 'const') return undefined;
    return { kind: 'unary', op, operand };
  }

  // `s.length` — both user-code `.length` and model-side `$.length` route here:
  // a symbolic string's length stays symbolic as a strlen node.
  protected lengthInfo(s: Valued<Sym>): Sym | undefined {
    const src = this.symOf(s);
    if (src.kind === 'const') return undefined;
    return { kind: 'strlen', src };
  }

  // ToIntegerOrInfinity truncate: keep a symbolic numeric operand symbolic across
  // the integer coercion (identity in concolic's Int domain).
  protected truncateInfo(x: Valued<Sym>): Sym | undefined {
    const src = this.symOf(x);
    if (src.kind === 'const') return undefined;
    return { kind: 'truncate', src };
  }

  // A branch (user-code `if`/`&&`/… via D$.C, or a model-internal bound check via
  // $.condition) was taken. If its condition is symbolic, record it as a path
  // constraint; the concrete `taken` direction fixes its polarity. Both branch
  // sources funnel here through FlowAnalysis.condition.
  protected conditionInfo(id: number, cond: Valued<Sym>, taken: boolean): void {
    const sym = this.symOf(cond);
    if (sym.kind !== 'const') {
      this.pathConstraints.push({ id, constraint: sym, taken });
    }
  }

  // The symbolic expression for an operand: its attached Info, else a constant of
  // its concrete value.
  private symOf(v: Valued<Sym>): Sym {
    return v.info ?? { kind: 'const', value: v.value };
  }

  // --- prelude entry points ------------------------------------------------

  // Tag the (already-wrapped) seed as symbolic variable `name` and return it so
  // the program keeps running concretely on it. Identity-wrapping means the
  // seed's value never aliases an unrelated literal of the same value.
  makeSymbolic(name: unknown, seed: unknown): unknown {
    // The seed's concrete type fixes the variable's SMT sort: a string seed is a
    // String variable, anything else an Int (the only two sorts we translate).
    const sort: Sort = typeof this.valued(seed).value === 'string' ? 'String' : 'Int';
    this.setInfo(seed, {
      kind: 'var',
      name: String(this.valued(name).value),
      sort,
    });
    return seed;
  }

  symbolicAssert(condArg: unknown): void {
    const cond = this.valued(condArg);
    const sym = this.symOf(cond);
    if (sym.kind === 'const') {
      // No symbolic dependency: the assert reduces to its concrete truth value.
      console.log(
        cond.value ? '@@DJX_VERDICT detected' : '@@DJX_VERDICT clean',
      );
      return;
    }
    let verdict: 'valid' | 'invalid' | 'unknown';
    try {
      verdict = solveValidity(this.pathConstraints, sym);
    } catch (e) {
      console.error(`[concolic] assert unsolved: ${(e as Error).message}`);
      return; // no marker -> runner records `error`
    }
    console.error(
      `[concolic] assert ${symToString(sym)} under ${this.pathConstraints.length} ` +
        `constraint(s) -> ${verdict}`,
    );
    console.log(
      verdict === 'valid' ? '@@DJX_VERDICT detected' : '@@DJX_VERDICT clean',
    );
  }

  endExecution() {
    D$.analysis.result = {
      pathConstraints: this.pathConstraints.map((p) => ({
        id: p.id,
        taken: p.taken,
        constraint: symToString(p.constraint),
      })),
    };
  }
}

D$.analysis = new ConcolicAnalysis();
