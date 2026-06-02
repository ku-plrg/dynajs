import { execFileSync } from 'node:child_process';
import { FlowAnalysis, type BinFrame, type UnFrame } from '@/model/flow.js';
import type { Wrapped } from '@/model/type.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

installPrelude();

type Sym =
  | { kind: 'const'; value: unknown }
  | { kind: 'var'; name: string }
  | { kind: 'unary'; op: string; operand: Sym }
  | { kind: 'binary'; op: string; left: Sym; right: Sym };

// A branch actually taken during concrete execution: `constraint` is the
// symbolic form of the condition, `taken` whether it was truthy. Together these
// form the path condition leading up to a __symbolic_assert__.
type PathConstraint = { id: number; constraint: Sym; taken: boolean };

// ---------------------------------------------------------------------------
// SMT-LIB translation
//
// Scope: integer arithmetic, comparisons, and boolean logic — enough for the
// concolic microbenches. Unsupported operators (bitwise, **, string ops, ...)
// throw `UnsupportedSym`; symbolicAssert turns that into an `error` verdict
// rather than silently mis-translating.
// ---------------------------------------------------------------------------

class UnsupportedSym extends Error {}

// op -> SMT-LIB builder. Comparisons/arith map almost 1:1; equality and
// inequality need (=)/(not (=)); integer / and % become div/mod.
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
  '%': (a, b) => `(mod ${a} ${b})`,
  '&&': (a, b) => `(and ${a} ${b})`,
  '||': (a, b) => `(or ${a} ${b})`,
};

function constToSmt(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value < 0 ? `(- ${-value})` : `${value}`;
  }
  throw new UnsupportedSym(`unsupported constant: ${JSON.stringify(value)}`);
}

function symToSmt(s: Sym, vars: Set<string>): string {
  switch (s.kind) {
    case 'const':
      return constToSmt(s.value);
    case 'var':
      vars.add(s.name);
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
  }
}

function symToString(s: Sym): string {
  switch (s.kind) {
    case 'const':
      return JSON.stringify(s.value);
    case 'var':
      return s.name;
    case 'unary':
      return `(${s.op} ${symToString(s.operand)})`;
    case 'binary':
      return `(${symToString(s.left)} ${s.op} ${symToString(s.right)})`;
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
  const vars = new Set<string>();
  const lines: string[] = [];
  for (const p of pc) {
    const c = symToSmt(p.constraint, vars);
    lines.push(`(assert ${p.taken ? c : `(not ${c})`})`);
  }
  lines.push(`(assert (not ${symToSmt(assertSym, vars)}))`);

  const smt =
    [...vars].map((v) => `(declare-const ${v} Int)`).join('\n') +
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
// symbolic expression for a value is stored as its `Info` (= Sym).
//
// FlowAnalysis's *Info hooks are operator-unaware (numeric binary falls through
// to baseInfo, dropping the op) and it leaves decision values wrapped, so we
// override binary/unary/condition here rather than route through them. A future
// flow.ts that exposes op-aware hooks + raw decision values could absorb this.
export class ConcolicAnalysis extends FlowAnalysis<Sym> {
  result: unknown;
  private pathConstraints: PathConstraint[] = [];

  static OPAQUE_CALLS = new Set<unknown>([console.log]);

  protected isOpaqueFunction(f: unknown) {
    return ConcolicAnalysis.OPAQUE_CALLS.has(f);
  }

  // Symbolic info propagates only through the operator overrides below; base /
  // string paths carry no symbolic meaning, so the abstract hooks are inert.
  protected baseInfo(): Sym | undefined {
    return undefined;
  }
  protected substringInfo(): Sym | undefined {
    return undefined;
  }
  protected concatenateInfo(): Sym | undefined {
    return undefined;
  }

  // The symbolic expression for a wrapped value: its attached Info, else a
  // constant of its concrete (unwrapped) value.
  private symOf(w: Wrapped<unknown>): Sym {
    return this.getInfo(w) ?? { kind: 'const', value: this.unwrap(w) };
  }

  // --- prelude entry points ------------------------------------------------

  // Tag the (already-wrapped) seed as symbolic variable `name` and return it so
  // the program keeps running concretely on it. Identity-wrapping means the
  // seed's value never aliases an unrelated literal of the same value.
  makeSymbolic(name: unknown, seed: unknown): unknown {
    const w = seed as Wrapped<unknown>;
    this.setInfo(w, {
      kind: 'var',
      name: String(this.unwrap(name as Wrapped<unknown>)),
    });
    return w;
  }

  symbolicAssert(condArg: unknown): void {
    const cond = condArg as Wrapped<unknown>;
    const sym = this.symOf(cond);
    if (sym.kind === 'const') {
      // No symbolic dependency: the assert reduces to its concrete truth value.
      console.log(
        this.unwrap(cond) ? '@@DJX_VERDICT detected' : '@@DJX_VERDICT clean',
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

  // --- hooks (operator-aware; values arrive wrapped) -----------------------

  // FlowAnalysis.binaryPre already peeked the operands (so the engine computed
  // the raw result) and stashed the wrapped operands in the frame. We rebuild
  // the symbolic form from them. A binary of two constants carries no symbolic
  // info, so we leave the result a plain wrapped constant (keeps it out of the
  // path condition).
  binary(
    _id: number,
    op: string,
    _l: Wrapped,
    _r: Wrapped,
    result: unknown,
    frame?: unknown,
  ) {
    const f = frame as BinFrame;
    const w = this.wrap(result);
    const left = this.symOf(f.left);
    const right = this.symOf(f.right);
    if (left.kind !== 'const' || right.kind !== 'const') {
      this.setInfo(w, { kind: 'binary', op, left, right });
    }
    return { result: w };
  }

  unary(
    _id: number,
    op: string,
    _prefix: boolean,
    _operand: unknown,
    result: unknown,
    frame?: unknown,
  ) {
    const f = frame as UnFrame;
    const w = this.wrap(result);
    const operand = this.symOf(f.operand);
    if (operand.kind !== 'const') {
      this.setInfo(w, { kind: 'unary', op, operand });
    }
    return { result: w };
  }

  // Record the branch as a path constraint, and — crucially — hand the engine
  // the *raw* (unwrapped) value so control flow branches correctly; a wrapped
  // boolean is a proxy object and would read as always-truthy.
  condition(id: number, _op: string, value: unknown) {
    const w = value as Wrapped<unknown>;
    const raw = this.unwrap<unknown>(w);
    const sym = this.symOf(w);
    if (sym.kind !== 'const') {
      this.pathConstraints.push({ id, constraint: sym, taken: Boolean(raw) });
    }
    return { result: raw };
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
