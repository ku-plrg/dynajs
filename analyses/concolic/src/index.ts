import { execFileSync } from 'node:child_process';
import {
  FlowAnalysis,
  type BinFrame,
  type UnFrame,
  type GetFieldFrame,
} from '@/model/flow.js';
import type { Wrapped } from '@/model/type.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

installPrelude();

// SMT sort a symbolic variable is declared with — inferred from its seed's
// concrete type (string -> String, otherwise Int).
type Sort = 'Int' | 'String';

type Sym =
  | { kind: 'const'; value: unknown }
  | { kind: 'var'; name: string; sort: Sort }
  | { kind: 'unary'; op: string; operand: Sym }
  | { kind: 'binary'; op: string; left: Sym; right: Sym }
  // string structure (z3 String theory): concatenation, fixed-window
  // substring/char-access, and length.
  | { kind: 'concat'; left: Sym; right: Sym }
  | { kind: 'substr'; src: Sym; start: number; length: number }
  | { kind: 'strlen'; src: Sym };

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
    case 'concat':
      return `(${symToString(s.left)} ++ ${symToString(s.right)})`;
    case 'substr':
      return `${symToString(s.src)}[${s.start}..${s.start + s.length}]`;
    case 'strlen':
      return `len(${symToString(s.src)})`;
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

  // baseInfo is operator-unaware, so it can't tell e.g. `.length` from any other
  // field read — that case is recovered in the `getField` override below. Plain
  // base propagation therefore carries no symbolic meaning and stays inert.
  protected baseInfo(): Sym | undefined {
    return undefined;
  }

  // The model routes string-builtin results (charAt/slice/substring/...) and the
  // `s[i]` char-access through these hooks, so they DO carry symbolic structure.
  protected substringInfo(
    src: Sym | undefined,
    start: number,
    resultLength: number,
  ): Sym | undefined {
    // Non-symbolic source -> result has no symbolic dependency.
    if (src === undefined) return undefined;
    return { kind: 'substr', src, start, length: resultLength };
  }

  protected concatenateInfo(
    left: Sym | undefined,
    _leftLength: number,
    right: Sym | undefined,
    _rightLength: number,
  ): Sym | undefined {
    // This hook gets only each side's Info, not its concrete value, so a
    // non-symbolic side can't be reconstructed as a string constant — track only
    // when both sides are symbolic. The common `sym + "literal"` shape is the `+`
    // operator, which `binary` handles below (it has the wrapped operands).
    if (left === undefined || right === undefined) return undefined;
    return { kind: 'concat', left, right };
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
    // The seed's concrete type fixes the variable's SMT sort: a string seed is a
    // String variable, anything else an Int (the only two sorts we translate).
    const sort: Sort = typeof this.unwrap(w) === 'string' ? 'String' : 'Int';
    this.setInfo(w, {
      kind: 'var',
      name: String(this.unwrap(name as Wrapped<unknown>)),
      sort,
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
      // `+` with a string operand is concatenation, not numeric addition — emit a
      // string-concat node (str.++) rather than an arithmetic (+ ...). The wrapped
      // operands are in scope here, so a non-symbolic side keeps its string const.
      const isStringPlus =
        op === '+' &&
        (typeof this.unwrap(f.left) === 'string' ||
          typeof this.unwrap(f.right) === 'string');
      this.setInfo(
        w,
        isStringPlus
          ? { kind: 'concat', left, right }
          : { kind: 'binary', op, left, right },
      );
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

  // `s.length` on a symbolic string is the one field read with symbolic meaning;
  // baseInfo can't recover it (operator-unaware), so we special-case it to a
  // str.len node and delegate every other read (incl. the `s[i]` char-access,
  // which the base path routes through substringInfo) to FlowAnalysis.
  getField(id: number, base: any, prop: any, result: any, frame?: unknown) {
    const f = frame as GetFieldFrame;
    const b: unknown = this.unwrap(f.base);
    const p: unknown = this.unwrap(f.prop);
    if (typeof b === 'string' && p === 'length') {
      const src = this.symOf(f.base);
      const w = this.wrap(result);
      if (src.kind !== 'const') this.setInfo(w, { kind: 'strlen', src });
      return { result: w };
    }
    return super.getField(id, base, prop, result, frame);
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
