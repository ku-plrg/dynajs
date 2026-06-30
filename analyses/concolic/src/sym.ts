// Symbolic-expression IR for the concolic analysis. Engine-neutral (kept under
// `analyses/shared/` so any analysis that builds a `Sym` tree from the
// operator-aware flow.ts hooks can reuse it and supply its own solver
// translation); concolic emits SMT-LIB strings for shell z3. Only the data type
// and the pretty-printer live here.

// SMT sort a symbolic variable is declared with. A symbolic `number` is Real
// (ExpoSE-faithful; integer *literals* stay Int and z3 promotes them), strings
// String, and symbolic arrays the `*Seq` sorts. Despite the name, those map to
// z3 *Array* theory `(Array Int T)` (ExpoSE's mkArray), not Sequence theory: z3
// returns `unknown` on string content over `(Seq String)` but decides it over
// `(Array Int String)`. A z3 array has no length, so the element sort lives here
// and the array's length is a separate Int variable (see ConcolicAnalysis).
export type Sort =
  | 'Int'
  | 'Real'
  | 'String'
  | 'Bool'
  | 'IntSeq'
  | 'StringSeq'
  | 'BoolSeq';

// The element sort of a sequence sort (`StringSeq` -> `String`), used when a
// select/operation needs the scalar sort behind a symbolic array.
export function seqElementSort(sort: Sort): Sort | undefined {
  switch (sort) {
    case 'IntSeq':
      return 'Int';
    case 'StringSeq':
      return 'String';
    case 'BoolSeq':
      return 'Bool';
    default:
      return undefined;
  }
}

export function isSeqSort(sort: Sort): boolean {
  return seqElementSort(sort) !== undefined;
}

// Int and Real are JS `number`s: mutually coercible (z3 `to_int`/`to_real`) and
// comparable for equality. String/Bool/Seq are disjoint domains.
export function isNumericSort(sort: Sort | undefined): boolean {
  return sort === 'Int' || sort === 'Real';
}

// The sort of an arithmetic combination of two numeric operands: Real if either
// is Real (JS `number` arithmetic is real), else Int. ExpoSE keeps every number
// Real; we let pure-integer subexpressions (lengths, indices) stay Int so they
// translate without coercion, and lift to Real only where a Real actually meets
// them. An undefined operand sort (a non-scalar) defaults to Int.
export function arithSort(a: Sort | undefined, b: Sort | undefined): Sort {
  return a === 'Real' || b === 'Real' ? 'Real' : 'Int';
}

// Can two sorts be compared for (in)equality without an ill-typed constraint?
// Equal sorts, or both numeric (Int/Real bridge via coercion).
export function sortsComparable(a: Sort, b: Sort): boolean {
  return a === b || (isNumericSort(a) && isNumericSort(b));
}

const BOOL_BINARY_OPS = new Set([
  '<',
  '<=',
  '>',
  '>=',
  '===',
  '==',
  '!==',
  '!=',
  '&&',
  '||',
  '=>',
]);

// The SMT sort a Sym denotes when statically determinable from its structure;
// undefined when not (a seq kind). A concolic value has one definite
// sort per path, so this lets equality drop a cross-sort comparison — e.g. a
// numeric StringIndexOf result vs the "not-found" string sentinel (a discriminated
// union arm) is concretely false, not a (ill-typed) symbolic constraint.
export function sortOf(s: Sym): Sort | undefined {
  switch (s.kind) {
    case 'const':
      switch (typeof s.value) {
        case 'string':
          return 'String';
        case 'boolean':
          return 'Bool';
        // Integer-valued literals stay Int (z3 promotes them in a Real context),
        // so pure-integer subexpressions translate without coercion; only a
        // genuine fraction is Real.
        case 'number':
          return Number.isInteger(s.value) ? 'Int' : 'Real';
        default:
          return undefined;
      }
    case 'var':
      return s.sort;
    case 'unary':
      // `!` and the integrality predicate `isInteger` yield Bool; the rounding ops
      // floor/ceil/round yield a Real (their z3 encoding uses to_int/to_real);
      // `typeof` yields a type-name String; arithmetic unaries (`-`/`+`) keep the
      // operand's sort.
      if (s.op === '!' || s.op === 'isInteger') return 'Bool';
      if (s.op === 'floor' || s.op === 'ceil' || s.op === 'round')
        return 'Real';
      if (s.op === 'typeof') return 'String';
      return sortOf(s.operand);
    case 'binary':
      if (BOOL_BINARY_OPS.has(s.op)) return 'Bool';
      if (s.op === '/') return 'Real'; // JS division is always real (7/2 === 3.5)
      return arithSort(sortOf(s.left), sortOf(s.right));
    case 'concat':
    case 'substr':
    case 'trim':
      return 'String';
    case 'truncate':
      return 'Real'; // ToIntegerOrInfinity yields a (Real) number
    case 'strlen':
      return 'Int';
    case 'strIndexOf':
      return 'Int';
    case 'select':
      return s.elemSort;
    case 'store':
      return sortOf(s.arr); // a `(Array Int T)` sort (the base array's)
    case 'bvar':
      return s.sort;
    case 'forall':
    case 'exists':
    case 'inRe':
    case 'contains':
      return 'Bool';
    case 'ite':
      return sortOf(s.then); // both arms share a sort by construction
    default:
      return undefined;
  }
}

// Engine-neutral regular-expression AST (z3 regex / SMT-LIB `re.*` theory),
// the target of the JS-regexp encoder in `@shared/regex`. A faithful image of
// the z3javascript `ctx.mkRe*` combinators ExpoSE's RegexModels builds: a
// literal string (`str.to_re`), a single-character range (`re.range`), and the
// union/intersection/complement/concatenation/closure operators. Carries no
// `Sym` — it is pure regex structure; the string being matched lives in the
// `inRe` Sym that references it.
export type ReNode =
  | { kind: 'reLit'; value: string }
  | { kind: 'reRange'; lo: string; hi: string }
  | { kind: 'reUnion'; left: ReNode; right: ReNode }
  | { kind: 'reInter'; left: ReNode; right: ReNode }
  | { kind: 'reConcat'; left: ReNode; right: ReNode }
  | { kind: 'reStar'; body: ReNode }
  | { kind: 'rePlus'; body: ReNode }
  | { kind: 'reOpt'; body: ReNode }
  | { kind: 'reComp'; body: ReNode }
  | { kind: 'reLoop'; body: ReNode; lo: number; hi: number };

export type Sym =
  | { kind: 'const'; value: unknown }
  | { kind: 'var'; name: string; sort: Sort }
  | { kind: 'unary'; op: string; operand: Sym }
  | { kind: 'binary'; op: string; left: Sym; right: Sym }
  // string structure (z3 String theory): concatenation, fixed-window
  // substring/char-access, and length. `start` is normally the concrete window
  // offset, but stays symbolic for a char-access at a computed index (e.g.
  // `r[r.length - 1]`), where pinning it to the seed's offset would drop the
  // dependence on the subject's symbolic length.
  | { kind: 'concat'; left: Sym; right: Sym }
  | { kind: 'substr'; src: Sym; start: number | Sym; length: number | Sym }
  | { kind: 'strlen'; src: Sym }
  // String.prototype.trim/trimStart/trimEnd (`$.trim`): `src` with leading
  // and/or trailing whitespace stripped. No single z3 string operator trims, so
  // smt.ts unfolds it through the recursive `str.whiteLeft`/`str.whiteRight`
  // helpers (ExpoSE's StringModels) into a substring over the whitespace-run
  // bounds.
  | { kind: 'trim'; src: Sym; leading: boolean; trailing: boolean }
  // ToIntegerOrInfinity's truncate-toward-zero (ℝ -> integer-valued Real),
  // encoded over the Real domain as sign(x) * floor(|x|) (ite + to_int/to_real).
  | { kind: 'truncate'; src: Sym }
  // symbolic-array structure (z3 Array theory, ExpoSE-faithful). A JS array maps
  // to `(Array Int T)`; z3 arrays carry no length, so each symbolic array's
  // length is a separate Int variable tracked in the analysis's ArrayMeta (not in
  // this IR). Modeling arrays as `(Array Int String)` rather than `(Seq String)`
  // is what makes element *content* solvable: z3 returns `unknown` on string
  // content over `seq.nth`, but decides `(select a i)`. `select`/`store` are the
  // element read/write; `elemSort` is the scalar sort of the read element (coerced
  // when it meets another numeric sort), the index coerced to Int. indexOf and
  // includes are assembled in the hook from a fresh result symbol plus quantified
  // constraints, so the IR carries the quantifier forms over a bound variable
  // `bvar` (ExpoSE's mkForAll/mkExists for "no prior match" / "some index").
  | { kind: 'select'; arr: Sym; index: Sym; elemSort: Sort }
  | { kind: 'store'; arr: Sym; index: Sym; value: Sym }
  | { kind: 'forall'; bound: string; boundSort: Sort; body: Sym; pattern?: Sym }
  | { kind: 'exists'; bound: string; boundSort: Sort; body: Sym; pattern?: Sym }
  | { kind: 'bvar'; name: string; sort: Sort }
  // regex membership (z3 String theory): does `str` match the regular
  // expression `re`? The boolean a regex `test`/`exec`/`match`/`search` forks
  // on. `re` is an engine-neutral `ReNode`, not a `Sym`.
  | { kind: 'inRe'; str: Sym; re: ReNode }
  // substring containment (z3 String theory `str.contains`): does `str` contain
  // `sub`? The boolean a String "contains" condition (e.g. replaceAll's
  // global-flag check) forks on.
  | { kind: 'contains'; str: Sym; sub: Sym }
  // String.prototype.indexOf's irreducible matcher (z3 String theory
  // `str.indexof`): the least index >= `from` at which `sub` occurs in `src`, or
  // -1 if it does not occur (or `from` exceeds the length). A concrete-path scan
  // can only return the single index it walked to — never the not-found (-1) arm —
  // so indexOf needs this one flippable Int term for an `=== -1` query to be SAT.
  | { kind: 'strIndexOf'; src: Sym; sub: Sym; from: Sym }
  // if-then-else over Syms (`(ite c t e)`); both arms share a sort. Used by
  // `search` (match index, else -1) and the min/max encodings.
  | { kind: 'ite'; cond: Sym; then: Sym; else: Sym };

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
    case 'substr': {
      const start =
        typeof s.start === 'number' ? String(s.start) : symToString(s.start);
      const length =
        typeof s.length === 'number' ? String(s.length) : symToString(s.length);
      return `${symToString(s.src)}[${start}..+${length}]`;
    }
    case 'strlen':
      return `len(${symToString(s.src)})`;
    case 'trim':
      return `trim${s.leading ? 'L' : ''}${s.trailing ? 'R' : ''}(${symToString(s.src)})`;
    case 'truncate':
      return `trunc(${symToString(s.src)})`;
    case 'select':
      return `${symToString(s.arr)}[${symToString(s.index)}]`;
    case 'store':
      return `${symToString(s.arr)}{${symToString(s.index)}:=${symToString(s.value)}}`;
    case 'forall':
      return `(∀${s.bound}. ${symToString(s.body)})`;
    case 'exists':
      return `(∃${s.bound}. ${symToString(s.body)})`;
    case 'bvar':
      return s.name;
    case 'inRe':
      return `${symToString(s.str)} ∈ /${reToString(s.re)}/`;
    case 'contains':
      return `contains(${symToString(s.str)}, ${symToString(s.sub)})`;
    case 'strIndexOf':
      return `indexOf(${symToString(s.src)}, ${symToString(s.sub)}, ${symToString(s.from)})`;
    case 'ite':
      return `(${symToString(s.cond)} ? ${symToString(s.then)} : ${symToString(s.else)})`;
  }
}

// Human-readable rendering of a regex AST (path-condition logging only).
export function reToString(re: ReNode): string {
  switch (re.kind) {
    case 'reLit':
      return re.value;
    case 'reRange':
      return `[${re.lo}-${re.hi}]`;
    case 'reUnion':
      return `(${reToString(re.left)}|${reToString(re.right)})`;
    case 'reInter':
      return `(${reToString(re.left)}&${reToString(re.right)})`;
    case 'reConcat':
      return `${reToString(re.left)}${reToString(re.right)}`;
    case 'reStar':
      return `(${reToString(re.body)})*`;
    case 'rePlus':
      return `(${reToString(re.body)})+`;
    case 'reOpt':
      return `(${reToString(re.body)})?`;
    case 'reComp':
      return `(¬${reToString(re.body)})`;
    case 'reLoop':
      return `(${reToString(re.body)}){${re.lo},${re.hi}}`;
  }
}
