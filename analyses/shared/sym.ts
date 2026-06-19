// Symbolic-expression IR for the concolic analysis. Engine-neutral (kept under
// `analyses/shared/` so any analysis that builds a `Sym` tree from the
// operator-aware flow.ts hooks can reuse it and supply its own solver
// translation); concolic emits SMT-LIB strings for shell z3. Only the data type
// and the pretty-printer live here.

// SMT sort a symbolic variable is declared with. concolic uses Int/String for
// scalars and the `*Seq` sorts for symbolic arrays (z3 Sequence theory: a JS
// array maps to `(Seq T)`, which carries both length and elements). Real is
// reserved for a Real-sort (ExpoSE-faithful) variant.
export type Sort = 'Int' | 'Real' | 'String' | 'Bool' | 'IntSeq' | 'StringSeq' | 'BoolSeq';

// The element sort of a sequence sort (`StringSeq` -> `String`), used when a
// select/operation needs the scalar sort behind a symbolic array.
export function seqElementSort(sort: Sort): Sort | undefined {
  switch (sort) {
    case 'IntSeq': return 'Int';
    case 'StringSeq': return 'String';
    case 'BoolSeq': return 'Bool';
    default: return undefined;
  }
}

export function isSeqSort(sort: Sort): boolean {
  return seqElementSort(sort) !== undefined;
}

const BOOL_BINARY_OPS = new Set(['<', '<=', '>', '>=', '===', '==', '!==', '!=', '&&', '||', '=>']);

// The SMT sort a Sym denotes when statically determinable from its structure;
// undefined when not (a `select` whose element sort isn't carried here, a seq
// kind, or `lost`). A concolic value has one definite sort per path, so this lets
// equality drop a cross-sort comparison — e.g. a numeric StringIndexOf result vs
// the "not-found" string sentinel (a discriminated union arm) is concretely false,
// not a (ill-typed) symbolic constraint.
export function sortOf(s: Sym): Sort | undefined {
  switch (s.kind) {
    case 'const':
      switch (typeof s.value) {
        case 'string': return 'String';
        case 'boolean': return 'Bool';
        case 'number': return 'Int';
        default: return undefined;
      }
    case 'var': return s.sort;
    case 'unary': return s.op === '!' ? 'Bool' : 'Int';
    case 'binary': return BOOL_BINARY_OPS.has(s.op) ? 'Bool' : 'Int';
    case 'concat':
    case 'substr': return 'String';
    case 'strlen':
    case 'truncate':
    case 'arrlen':
    case 'seqIndexOf': return 'Int';
    case 'seqContains':
    case 'inRe': return 'Bool';
    case 'ite': return sortOf(s.then); // both arms share a sort by construction
    default: return undefined; // select (elem sort not carried), seq*, lost
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
  // substring/char-access, and length.
  | { kind: 'concat'; left: Sym; right: Sym }
  | { kind: 'substr'; src: Sym; start: number; length: number }
  | { kind: 'strlen'; src: Sym }
  // ToIntegerOrInfinity's truncate-toward-zero (ℝ -> integer value). concolic's
  // Int domain makes it identity; a Real-sort variant would encode it exactly
  // (ite + real2int).
  | { kind: 'truncate'; src: Sym }
  // symbolic-array structure (z3 Sequence theory). `select`/`arrlen` are the
  // element-read and length of a symbolic array; the rest model the array
  // operations ExpoSE's ArrayModels covers (push -> seqConcat over a seqUnit,
  // pop/slice -> seqExtract, indexOf -> seqIndexOf, includes -> seqContains).
  | { kind: 'select'; arr: Sym; index: Sym }
  | { kind: 'arrlen'; arr: Sym }
  | { kind: 'seqUnit'; elem: Sym }
  | { kind: 'seqConcat'; left: Sym; right: Sym }
  | { kind: 'seqExtract'; src: Sym; offset: Sym; length: Sym }
  | { kind: 'seqIndexOf'; arr: Sym; sub: Sym; from: Sym }
  | { kind: 'seqContains'; arr: Sym; sub: Sym }
  // regex membership (z3 String theory): does `str` match the regular
  // expression `re`? The boolean a regex `test`/`exec`/`match`/`search` forks
  // on. `re` is an engine-neutral `ReNode`, not a `Sym`.
  | { kind: 'inRe'; str: Sym; re: ReNode }
  // if-then-else over Syms (`(ite c t e)`); both arms share a sort. Used by
  // `search` (match index, else -1) and the min/max encodings.
  | { kind: 'ite'; cond: Sym; then: Sym; else: Sym }
  // A symbolic value that flowed through an op with no symbolic model, so its
  // expression was dropped. NOT a constant: it depended on a symbolic input, we
  // just can't represent it. Tracked + propagated so a verdict that rests on it
  // can be recognised as info-loss rather than a faithful symbolic result.
  | { kind: 'lost' };

// Does a Sym contain a `lost` subexpression anywhere? (Children are the Sym-typed
// fields, so a generic walk over object values suffices.)
export function containsLost(s: Sym): boolean {
  if (s.kind === 'lost') return true;
  for (const v of Object.values(s)) {
    if (v !== null && typeof v === 'object' && 'kind' in v && containsLost(v as Sym)) return true;
  }
  return false;
}

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
    case 'select':
      return `${symToString(s.arr)}[${symToString(s.index)}]`;
    case 'arrlen':
      return `len(${symToString(s.arr)})`;
    case 'seqUnit':
      return `[${symToString(s.elem)}]`;
    case 'seqConcat':
      return `(${symToString(s.left)} ++ ${symToString(s.right)})`;
    case 'seqExtract':
      return `${symToString(s.src)}[${symToString(s.offset)}..+${symToString(s.length)}]`;
    case 'seqIndexOf':
      return `indexOf(${symToString(s.arr)}, ${symToString(s.sub)}, ${symToString(s.from)})`;
    case 'seqContains':
      return `contains(${symToString(s.arr)}, ${symToString(s.sub)})`;
    case 'inRe':
      return `${symToString(s.str)} ∈ /${reToString(s.re)}/`;
    case 'ite':
      return `(${symToString(s.cond)} ? ${symToString(s.then)} : ${symToString(s.else)})`;
    case 'lost':
      return '⊘';
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
