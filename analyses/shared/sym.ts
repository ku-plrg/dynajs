// Symbolic-expression IR for the concolic analysis. Engine-neutral (kept under
// `analyses/shared/` so any analysis that builds a `Sym` tree from the
// operator-aware flow.ts hooks can reuse it and supply its own solver
// translation); concolic emits SMT-LIB strings for shell z3. Only the data type
// and the pretty-printer live here.

// SMT sort a symbolic variable is declared with. concolic uses Int/String;
// Real/Bool are reserved for a Real-sort (ExpoSE-faithful) variant.
export type Sort = 'Int' | 'Real' | 'String' | 'Bool';

export type Sym =
  | { kind: 'const'; value: unknown }
  | { kind: 'var'; name: string; sort: Sort }
  | { kind: 'unary'; op: string; operand: Sym }
  | { kind: 'binary'; op: string; left: Sym; right: Sym }
  // string structure (z3 String theory): concatenation, fixed-window
  // substring/char-access, and length.
  | { kind: 'concat'; left: Sym; right: Sym }
  | { kind: 'substr'; src: Sym; start: number; length: number }
  | { kind: 'strlen'; src: Sym }
  // ToIntegerOrInfinity's truncate-toward-zero (ℝ -> integer value). concolic's
  // Int domain makes it identity; a Real-sort variant would encode it exactly
  // (ite + real2int).
  | { kind: 'truncate'; src: Sym };

// Thrown when a Sym uses an operator/constant outside the translatable scope;
// callers turn it into an `error` verdict rather than silently mis-translating.
export class UnsupportedSym extends Error {}

// Human-readable rendering of a Sym, used for path-condition logging.
export function symToString(s: Sym): string {
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
    case 'truncate':
      return `trunc(${symToString(s.src)})`;
  }
}
