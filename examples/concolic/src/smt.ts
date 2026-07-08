import { spawnSync } from 'node:child_process';
import {
  type Sym,
  type Sort,
  type ReNode,
  isSeqSort,
  isNumericSort,
  arithSort,
  sortOf,
  UnsupportedSym,
} from './sym.js';

// ---------------------------------------------------------------------------
// SMT-LIB translation + z3
//
// Scope: integer arithmetic, comparisons, boolean logic, a slice of the z3
// String theory — string equality, concatenation (`str.++`), fixed-window
// substring/char-access (`str.substr`), length (`str.len`), substring search
// (`str.indexof`), and containment (`str.contains`) — and the z3
// Sequence theory for symbolic arrays (`seq.nth`/`seq.len`/`seq.++`/`seq.unit`/
// `seq.extract`/`seq.indexof`/`seq.contains`) — enough for the concolic
// microbenches. Operators outside this set (bitwise, **, string ordering
// `< > <= >=`, ...) throw `UnsupportedSym`; callers turn that into an `error`
// verdict rather than silently mis-translating.
// (`Sym`/`Sort`/`UnsupportedSym`/`symToString` live in the engine-neutral
// `@shared/sym.js`; only the SMT-LIB translation below is concolic-only.)
// ---------------------------------------------------------------------------

// SMT-LIB rendering of a sort: scalars map to their name, the `*Seq` sorts to
// `(Seq T)` (z3 Sequence theory).
const SORT_SMT: Record<Sort, string> = {
  Int: 'Int',
  Real: 'Real',
  String: 'String',
  Bool: 'Bool',
  IntSeq: '(Array Int Int)',
  StringSeq: '(Array Int String)',
  BoolSeq: '(Array Int Bool)',
};

// op -> SMT-LIB builder. Comparisons/arith map almost 1:1; equality and
// inequality need (=)/(not (=)); `/` is real division (JS `/` is always real:
// 7/2 === 3.5). `%` is not here — it needs a sort-aware encoding (intMod/realMod).
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
  '/': (a, b) => `(/ ${a} ${b})`,
  '&&': (a, b) => `(and ${a} ${b})`,
  '||': (a, b) => `(or ${a} ${b})`,
  '=>': (a, b) => `(=> ${a} ${b})`,
  // No SMT-LIB primitive for min/max — encode via ite (used by clampInfo).
  max: (a, b) => `(ite (>= ${a} ${b}) ${a} ${b})`,
  min: (a, b) => `(ite (<= ${a} ${b}) ${a} ${b})`,
};

// Operator families that operate on numbers (and so coerce operands to a common
// Int/Real sort). `+ - * max min` and comparisons take the join of their
// operands' sorts; `/` is always Real; `%` is encoded below.
const ARITH_OPS = new Set(['+', '-', '*', 'max', 'min']);
const COMPARE_OPS = new Set(['<', '<=', '>', '>=']);
const EQUALITY_OPS = new Set(['===', '==', '!==', '!=']);

// A symbolic operand denotes a defined value of a fixed sort (a finite Real, a
// string, a bool, an array) — never JS `undefined`/`null`, never `NaN`/`±∞`.
// Those JS values have no z3 image and reach the IR only as constants from spec
// models that classify a number (`is(n, -∞)`, the `k in O` hole check `s[k] ===
// undefined`, ...). A comparison between such a constant and a symbolic operand
// therefore has a statically-known truth value, so we resolve it to a Bool
// literal instead of emitting an unrepresentable constant.
function outOfDomain(v: unknown): boolean {
  return (
    v === undefined ||
    v === null ||
    (typeof v === 'number' && !Number.isFinite(v))
  );
}
// Truth of `<symbolic> op <c>` with the finite/defined symbolic on the left and
// the out-of-domain `c` on the right. Equality is always decided; ordering only
// against ±∞ (NaN/undefined/null aren't ordered, so every ordering is false).
function outOfDomainTruth(op: string, c: unknown): boolean | undefined {
  if (op === '===' || op === '==') return false;
  if (op === '!==' || op === '!=') return true;
  if (typeof c === 'number' && !Number.isFinite(c)) {
    if (Number.isNaN(c)) return false;
    if (c === Infinity) return op === '<' || op === '<=';
    return op === '>' || op === '>='; // c === -Infinity
  }
  return undefined; // ordering against undefined/null: leave to the normal path
}
const FLIP_COMPARE: Record<string, string> = {
  '<': '>',
  '<=': '>=',
  '>': '<',
  '>=': '<=',
};
// If exactly one operand is an out-of-domain constant and the op is a
// comparison/equality, return its SMT Bool literal; otherwise undefined.
function outOfDomainCompare(
  op: string,
  left: Sym,
  right: Sym,
): string | undefined {
  if (!EQUALITY_OPS.has(op) && !COMPARE_OPS.has(op)) return undefined;
  const lo = left.kind === 'const' && outOfDomain(left.value);
  const ro = right.kind === 'const' && outOfDomain(right.value);
  if (lo === ro) return undefined; // need exactly one
  // Normalize to `<symbolic> op <const>`; flip the ordering op if the constant
  // was on the left.
  const constSym = (lo ? left : right) as Extract<Sym, { kind: 'const' }>;
  const truth = outOfDomainTruth(
    lo ? (FLIP_COMPARE[op] ?? op) : op,
    constSym.value,
  );
  return truth === undefined ? undefined : truth ? 'true' : 'false';
}

// JS `%` can't reuse SMT-LIB `mod`: `mod` is Euclidean (result in [0,|b|)),
// whereas JS `%` is truncated — the remainder takes the sign of the *dividend*
// (-2 % 3 === -2, not 1). Over the integers we encode sign(a) * (|a| mod |b|);
// over the reals, a - b * trunc(a/b) (the same truncated remainder).
function intMod(a: string, b: string): string {
  return `(ite (>= ${a} 0) (mod ${a} (abs ${b})) (- (mod (- ${a}) (abs ${b}))))`;
}
// trunc-toward-zero of a Real, as a Real: sign(x) * floor(|x|). SMT-LIB `to_int`
// is floor (toward -∞), so the sign trick recovers truncation for negatives.
function realTrunc(x: string): string {
  return `(ite (>= ${x} 0.0) (to_real (to_int ${x})) (to_real (- (to_int (- ${x})))))`;
}
function realMod(a: string, b: string): string {
  return `(- ${a} (* ${b} ${realTrunc(`(/ ${a} ${b})`)}))`;
}

// The ECMAScript trim whitespace set: WhiteSpace (Tab, LF, VT, FF, CR, SP, NBSP,
// the Unicode space separators, ZWNBSP) + LineTerminator (LS, PS) — exactly the
// set String.prototype.trim strips. (ExpoSE handles only the space char, per its
// own "TODO: Only handles" note in SymbolicState; covering the full set keeps the
// symbolic trim consistent with the concrete one.)
const TRIM_WS = [
  '\u0009', // Tab
  '\u000a', // LF
  '\u000b', // VT
  '\u000c', // FF
  '\u000d', // CR
  '\u0020', // SP
  '\u00a0', // NBSP
  '\u1680', // Ogham space mark
  '\u2000',
  '\u2001',
  '\u2002',
  '\u2003',
  '\u2004',
  '\u2005',
  '\u2006',
  '\u2007',
  '\u2008',
  '\u2009',
  '\u200a', // en quad..hair space
  '\u2028', // Line separator
  '\u2029', // Paragraph separator
  '\u202f', // Narrow NBSP
  '\u205f', // Medium mathematical space
  '\u3000', // Ideographic space
  '\ufeff', // ZWNBSP / BOM
];

// z3 recursive-function definitions backing the `trim` Sym (ExpoSE's
// SymbolicState._setupSmtFunctions), injected once when a trim term is present.
// whiteLeft(s,i) walks right over leading whitespace from i (returning the first
// non-whitespace index = leading-whitespace count); whiteRight(s,i) walks left
// over trailing whitespace from i (returning the last non-whitespace index). An
// out-of-bounds `str.at` is "" (not whitespace), so both bottom out at the ends.
const TRIM_PRELUDE =
  `(define-fun str.isWhite ((c String)) Bool (or ${TRIM_WS.map(
    (w) => `(= c ${smtString(w)})`,
  ).join(' ')}))\n` +
  '(define-fun-rec str.whiteLeft ((s String) (i Int)) Int (ite (str.isWhite (str.at s i)) (str.whiteLeft s (+ i 1)) i))\n' +
  '(define-fun-rec str.whiteRight ((s String) (i Int)) Int (ite (str.isWhite (str.at s i)) (str.whiteRight s (- i 1)) i))';

// String.prototype.trim, modeled as in ExpoSE's StringModels. trimStart keeps the
// window [WL, len) where WL = whiteLeft(t, 0); trimEnd keeps [0, WR + 1] where
// WR = whiteRight(t, len - 1); full trim composes the two (whiteRight applied to
// the already-left-trimmed term). (ExpoSE's trimRight passes `len`, not `len - 1`
// — an off-by-one that makes its trimEnd a no-op; we pass `len - 1` so trimEnd
// matches the concrete String.prototype.trimEnd this analysis re-executes.)
function trimLeftSmt(t: string): string {
  const wl = `(str.whiteLeft ${t} 0)`;
  return `(str.substr ${t} ${wl} (- (str.len ${t}) ${wl}))`;
}
function trimRightSmt(t: string): string {
  const wr = `(str.whiteRight ${t} (- (str.len ${t}) 1))`;
  return `(str.substr ${t} 0 (+ ${wr} 1))`;
}
function trimToSmt(t: string, leading: boolean, trailing: boolean): string {
  let out = t;
  if (leading) out = trimLeftSmt(out);
  if (trailing) out = trimRightSmt(out);
  return out;
}

// Wrap an already-rendered term so it reads as `to`. Only Int<->Real bridges; a
// matching or non-numeric `from` passes through. (Numeric *literals* never reach
// here — `operand` skips `const`, since z3 promotes them in either context.)
function coerce(smt: string, from: Sort | undefined, to: Sort): string {
  if (from === to) return smt;
  if (to === 'Real' && from === 'Int') return `(to_real ${smt})`;
  if (to === 'Int' && from === 'Real') return `(to_int ${smt})`;
  return smt;
}

// Render an operand and coerce it to the sort its position expects. A `const` is
// emitted bare: an integer literal is sort-polymorphic to z3, so wrapping it
// would only add noise.
function operand(s: Sym, vars: Map<string, Sort>, to: Sort): string {
  const smt = symToSmt(s, vars);
  return s.kind === 'const' ? smt : coerce(smt, sortOf(s), to);
}

// SMT-LIB string literal: double quotes, with an embedded `"` escaped as `""`.
// Non-printable / non-ASCII code units (regex char classes reach down to
// `\u{0}`..`\u{ff}`) render as z3's `\u{HH}` escape — a bare control byte in a
// quoted literal would break the SMT parser.
function smtString(v: string): string {
  let out = '"';
  for (const ch of v) {
    const c = ch.codePointAt(0)!;
    if (ch === '"') out += '""';
    else if (c >= 0x20 && c < 0x7f) out += ch;
    else out += `\\u{${c.toString(16)}}`;
  }
  return out + '"';
}

// SMT-LIB rendering of a regex AST (z3 `re.*` theory).
function reToSmt(re: ReNode): string {
  switch (re.kind) {
    case 'reLit':
      return `(str.to_re ${smtString(re.value)})`;
    case 'reRange':
      return `(re.range ${smtString(re.lo)} ${smtString(re.hi)})`;
    case 'reUnion':
      return `(re.union ${reToSmt(re.left)} ${reToSmt(re.right)})`;
    case 'reInter':
      return `(re.inter ${reToSmt(re.left)} ${reToSmt(re.right)})`;
    case 'reConcat':
      return `(re.++ ${reToSmt(re.left)} ${reToSmt(re.right)})`;
    case 'reStar':
      return `(re.* ${reToSmt(re.body)})`;
    case 'rePlus':
      return `(re.+ ${reToSmt(re.body)})`;
    case 'reOpt':
      return `(re.opt ${reToSmt(re.body)})`;
    case 'reComp':
      return `(re.comp ${reToSmt(re.body)})`;
    case 'reLoop':
      return `((_ re.loop ${re.lo} ${re.hi}) ${reToSmt(re.body)})`;
  }
}

function constToSmt(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return numberToSmt(value);
  if (typeof value === 'string') return smtString(value);
  throw new UnsupportedSym(`unsupported constant: ${JSON.stringify(value)}`);
}

// A JS number as an SMT numeral. Integer-valued numbers stay bare integer
// literals (z3 promotes them to Real wherever a Real is expected); a genuine
// fraction renders as a Real decimal. NaN/±Infinity have no SMT image, and
// exponential forms (1e-7) aren't SMT-LIB Real syntax — both become `error`.
function numberToSmt(v: number): string {
  if (!Number.isFinite(v)) throw new UnsupportedSym(`non-finite number: ${v}`);
  if (Number.isInteger(v)) return v < 0 ? `(- ${-v})` : `${v}`;
  const mag = String(Math.abs(v));
  if (mag.includes('e') || mag.includes('E')) {
    throw new UnsupportedSym(
      `number not representable as an SMT Real literal: ${v}`,
    );
  }
  return v < 0 ? `(- ${mag})` : mag;
}

function symToSmt(s: Sym, vars: Map<string, Sort>): string {
  switch (s.kind) {
    case 'const':
      return constToSmt(s.value);
    case 'var':
      vars.set(s.name, s.sort);
      return s.name;
    case 'unary': {
      // IsIntegralNumber: x is integral iff flooring it (to_int) and lifting back
      // (to_real) recovers x. Coerce to Real first so an Int operand is trivially
      // integral and a Real one is tested. Uses only to_int/to_real (always in the
      // logic the Real coercions already require).
      if (s.op === 'isInteger') {
        const r = operand(s.operand, vars, 'Real');
        return `(= (to_real (to_int ${r})) ${r})`;
      }
      // Rounding ops via z3 `to_int` (floor toward -∞), all returning a Real:
      //   floor(x) = ⌊x⌋;  ceil(x) = -⌊-x⌋;  Math.round(x) = ⌊x + 0.5⌋ (JS rounds
      //   half toward +∞, which floor(x+0.5) reproduces for every finite x).
      if (s.op === 'floor' || s.op === 'ceil' || s.op === 'round') {
        const r = operand(s.operand, vars, 'Real');
        if (s.op === 'floor') return `(to_real (to_int ${r}))`;
        if (s.op === 'ceil') return `(to_real (- (to_int (- ${r}))))`;
        return `(to_real (to_int (+ ${r} 0.5)))`;
      }
      // `typeof <symbolic>`: the operand's sort fixes the JS type tag (a symbolic
      // can't change runtime type), so resolve it to that constant string rather
      // than carrying an opaque `typeof` z3 has no operator for.
      if (s.op === 'typeof') {
        const so = sortOf(s.operand);
        const ty =
          so === 'String'
            ? 'string'
            : isNumericSort(so)
              ? 'number'
              : so === 'Bool'
                ? 'boolean'
                : so !== undefined && isSeqSort(so)
                  ? 'object'
                  : undefined;
        if (ty !== undefined) return smtString(ty);
        throw new UnsupportedSym(`unsupported typeof operand sort: ${so}`);
      }
      const x = symToSmt(s.operand, vars);
      if (s.op === '!') return `(not ${x})`;
      if (s.op === '-') return `(- ${x})`;
      if (s.op === '+') return x;
      throw new UnsupportedSym(`unsupported unary op: ${s.op}`);
    }
    case 'binary': {
      // A comparison against an out-of-domain constant (undefined/null/NaN/±∞)
      // has a fixed truth value — resolve it before any sort coercion.
      const ood = outOfDomainCompare(s.op, s.left, s.right);
      if (ood !== undefined) return ood;
      const ls = sortOf(s.left);
      const rs = sortOf(s.right);
      if (s.op === '%') {
        const to = arithSort(ls, rs);
        const a = operand(s.left, vars, to);
        const b = operand(s.right, vars, to);
        return to === 'Real' ? realMod(a, b) : intMod(a, b);
      }
      const build = SMT_BINARY[s.op];
      if (!build) throw new UnsupportedSym(`unsupported binary op: ${s.op}`);
      // The sort the operands meet at: Real for `/`; the numeric join for
      // arithmetic/comparisons; for equality only when both sides are numeric
      // (a non-numeric `===` keeps each side's own sort). Logic ops (&& || =>)
      // act on Bools — no coercion.
      let to: Sort | undefined;
      if (s.op === '/') to = 'Real';
      else if (ARITH_OPS.has(s.op) || COMPARE_OPS.has(s.op))
        to = arithSort(ls, rs);
      else if (EQUALITY_OPS.has(s.op) && isNumericSort(ls) && isNumericSort(rs))
        to = arithSort(ls, rs);
      const a = to ? operand(s.left, vars, to) : symToSmt(s.left, vars);
      const b = to ? operand(s.right, vars, to) : symToSmt(s.right, vars);
      return build(a, b);
    }
    case 'concat':
      return `(str.++ ${symToSmt(s.left, vars)} ${symToSmt(s.right, vars)})`;
    case 'substr': {
      const start =
        typeof s.start === 'number'
          ? String(s.start)
          : operand(s.start, vars, 'Int');
      const length =
        typeof s.length === 'number'
          ? String(s.length)
          : operand(s.length, vars, 'Int');
      return `(str.substr ${symToSmt(s.src, vars)} ${start} ${length})`;
    }
    case 'trim':
      return trimToSmt(symToSmt(s.src, vars), s.leading, s.trailing);
    case 'strlen':
      return `(str.len ${symToSmt(s.src, vars)})`;
    case 'truncate':
      return realTrunc(coerce(symToSmt(s.src, vars), sortOf(s.src), 'Real'));
    case 'select':
      return `(select ${symToSmt(s.arr, vars)} ${operand(s.index, vars, 'Int')})`;
    case 'store':
      return `(store ${symToSmt(s.arr, vars)} ${operand(s.index, vars, 'Int')} ${symToSmt(s.value, vars)})`;
    case 'bvar':
      // A quantifier-bound variable: it carries its own sort but is NOT free, so
      // it must not be collected into `vars` (it gets no declare-const — the
      // enclosing forall/exists binds it).
      return s.name;
    case 'forall':
    case 'exists': {
      const q = s.kind;
      const body = symToSmt(s.body, vars);
      const decl = `((${s.bound} ${SORT_SMT[s.boundSort]}))`;
      // A `:pattern` (ExpoSE's mkPattern) bounds z3's instantiation so an array
      // quantifier stays decidable instead of returning `unknown`.
      if (s.pattern !== undefined)
        return `(${q} ${decl} (! ${body} :pattern (${symToSmt(s.pattern, vars)})))`;
      return `(${q} ${decl} ${body})`;
    }
    case 'inRe':
      return `(str.in_re ${symToSmt(s.str, vars)} ${reToSmt(s.re)})`;
    case 'contains':
      return `(str.contains ${symToSmt(s.str, vars)} ${symToSmt(s.sub, vars)})`;
    case 'strIndexOf':
      // z3 `str.indexof` returns -1 when `sub` is absent at/after `from`, the same
      // sentinel JS indexOf uses, so the result needs no further mapping. The
      // offset coerces to Int (it can arrive Real via ToIntegerOrInfinity/clamp).
      return `(str.indexof ${symToSmt(s.src, vars)} ${symToSmt(s.sub, vars)} ${operand(s.from, vars, 'Int')})`;
    case 'ite':
      return `(ite ${symToSmt(s.cond, vars)} ${symToSmt(s.then, vars)} ${symToSmt(s.else, vars)})`;
  }
}

// ---------------------------------------------------------------------------

// A branch taken during concrete execution, as fed to the solver: the symbolic
// condition and the concrete direction it went.
export type Polarized = { constraint: Sym; taken: boolean };

// A satisfying assignment: each symbolic variable -> its concrete model value.
export type Solution = Map<string, unknown>;

// Assemble the SMT-LIB problem. The String/Sequence/Real theories (and the
// to_int/to_real coercions Reals pull in) need an explicit logic; the all-Int
// path stays bare so pure-integer benches translate byte-for-byte.
function buildSmt(
  vars: Map<string, Sort>,
  assertions: string[],
  tail: string,
): string {
  const needsLogic = [...vars.values()].some(
    (s) => s === 'String' || s === 'Real' || isSeqSort(s),
  );
  const body = assertions.join('\n') + '\n' + tail;
  // A `trim` Sym renders calls to `str.whiteLeft`/`str.whiteRight`; emit their
  // recursive definitions (TRIM_PRELUDE) once, only when such a call is present.
  // The distinctive `str.`-namespaced names make the substring scan reliable, and
  // an unused emission would be harmless valid SMT anyway. needsLogic is always
  // true here (a trim's source is a String var).
  const needsTrim = body.includes('str.white');
  return (
    (needsLogic ? '(set-logic ALL)\n' : '') +
    (needsTrim ? TRIM_PRELUDE + '\n' : '') +
    [...vars]
      .map(([v, sort]) => `(declare-const ${v} ${SORT_SMT[sort]})`)
      .join('\n') +
    '\n' +
    body +
    '\n'
  );
}

// Run z3 over a complete SMT-LIB problem and return its stdout. spawnSync (not
// execFileSync) so a non-zero exit doesn't throw: a `(get-value)` after an unsat
// `(check-sat)` makes z3 exit 1 while still printing `unsat` + an `(error ...)`
// on stdout, and we want that leading `unsat`. A genuine launch failure (z3
// missing) or empty output is unrecoverable -> UnsupportedSym (= `error` verdict).
function runZ3(smt: string): string {
  const r = spawnSync('z3', ['-in'], {
    input: smt,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.error)
    throw new UnsupportedSym(`z3 invocation failed: ${r.error.message}`);
  const out = (r.stdout ?? '').trim();
  if (out.length === 0) {
    throw new UnsupportedSym(
      `z3 produced no output: ${(r.stderr ?? '').trim()}`,
    );
  }
  return out;
}

// Translate a path condition to polarized assertions, collecting its variables.
function assertPath(
  pc: readonly Polarized[],
  vars: Map<string, Sort>,
): string[] {
  return pc.map((p) => {
    const c = symToSmt(p.constraint, vars);
    return `(assert ${p.taken ? c : `(not ${c})`})`;
  });
}

// Ask z3 whether `assertSym` necessarily holds under the path condition `pc`, by
// checking `pc ∧ ¬assert` for satisfiability:
//   unsat -> "valid"   (no counterexample: assert always holds)
//   sat   -> "invalid" (a model violates the assert)
//   else  -> "unknown"
export function solveValidity(
  pc: readonly Polarized[],
  assertSym: Sym,
): 'valid' | 'invalid' | 'unknown' {
  const vars = new Map<string, Sort>();
  const assertions = assertPath(pc, vars);
  assertions.push(`(assert (not ${symToSmt(assertSym, vars)}))`);
  const smt = buildSmt(vars, assertions, '(check-sat)');
  // DEBUG=1: show the SMT-LIB problem we hand to z3 for this assert before solving.
  if (process.env.DEBUG) console.error(`[concolic] SMT for assert:\n${smt}`);
  const out = runZ3(smt);
  if (out.startsWith('unsat')) return 'valid';
  if (out.startsWith('sat')) return 'invalid';
  return 'unknown';
}

// Ask z3 whether `assertSym` is *satisfiable* under the path condition `pc`, by
// checking `pc ∧ assert` for satisfiability — the dual of solveValidity:
//   sat   -> a witness exists (an input on this path makes `assert` hold)
//   unsat -> infeasible (no such input)
//   else  -> "unknown"
export function solveSat(
  pc: readonly Polarized[],
  assertSym: Sym,
): 'sat' | 'unsat' | 'unknown' {
  const vars = new Map<string, Sort>();
  const assertions = assertPath(pc, vars);
  assertions.push(`(assert ${symToSmt(assertSym, vars)})`);
  const smt = buildSmt(vars, assertions, '(check-sat)');
  // DEBUG=1: show the SMT-LIB problem we hand to z3 for this query before solving.
  if (process.env.DEBUG) console.error(`[concolic] SMT for IS_SAT:\n${smt}`);
  const out = runZ3(smt);
  if (out.startsWith('sat')) return 'sat';
  if (out.startsWith('unsat')) return 'unsat';
  return 'unknown';
}

// Is the path condition satisfiable, and if so, what concrete inputs realise it?
// Returns the satisfying assignment for every variable that appears, or null
// when unsat / unknown / variable-free. The model-extraction counterpart to
// solveValidity: alternatives() negates one branch and reads back a child input.
// How many elements we read back per symbolic array. z3 `(Array Int T)` has no
// length, so we materialise a bounded prefix (ExpoSE bounds arrays too); pure
// symbols seed length-1 arrays, so this is generous.
export const ARRAY_READBACK_BOUND = 64;

export function solveModel(pc: readonly Polarized[]): Solution | null {
  const vars = new Map<string, Sort>();
  const assertions = assertPath(pc, vars);
  if (vars.size === 0) return null; // no symbol -> no input to derive

  // A z3 array prints as a store/lambda form `(get-value (a))` can't decode, and
  // it carries no length. Mirror ExpoSE's asConstant instead: read each array's
  // separate length var `<a>_len` (a plain Int free var) as a scalar, and request
  // `(select a i)` for a bounded index range; parseGetValue reassembles the JS
  // array from those. Without this an array child input is dropped and a
  // negated-branch replay can never steer the array's contents.
  const scalarNames: string[] = [];
  const arrayNames: string[] = [];
  for (const [name, sort] of vars)
    (isSeqSort(sort) ? arrayNames : scalarNames).push(name);
  const selectTerms = arrayNames.flatMap((a) =>
    Array.from(
      { length: ARRAY_READBACK_BOUND },
      (_, i) => `(select ${a} ${i})`,
    ),
  );

  const out = runZ3(
    buildSmt(
      vars,
      assertions,
      `(check-sat)\n(get-value (${[...scalarNames, ...selectTerms].join(' ')}))`,
    ),
  );
  if (!out.startsWith('sat')) return null; // unsat or unknown
  return parseGetValue(out.slice(out.indexOf('\n') + 1), arrayNames);
}

// --- z3 (get-value) response parser ----------------------------------------
// z3 answers `(get-value (v...))` with `((v1 val1) (v2 val2) ...)` where each
// val is a leaf form: an Int atom (`5`) or its negation (`(- 3)`), a Real decimal
// (`1.5`) or rational (`(/ 1 3)`), a String literal (`"x"`, `""`-escaped), or a
// Bool (`true`/`false`). Tokenize (strings atomic, `""` -> `"`), parse to nested
// lists, then read each (name value) pair.

type Tok =
  | { t: '(' | ')' }
  | { t: 'str'; v: string }
  | { t: 'atom'; v: string };

// Decode z3's SMT-LIB string escapes back to the actual characters. z3 prints a
// non-printable / non-ASCII code point in a model string as `\u{HEX}` (1–6
// lowercase hex digits) — the inverse of `smtString`. It is the ONLY escape we
// can meet: a literal backslash that would otherwise begin such a sequence is
// itself emitted as `\u{5c}` (z3 escapes `\` exactly when leaving it raw would
// look like an escape), so any `\` not opening a valid `\u{HEX}` is a literal
// backslash and passes through untouched. The scan is single-pass left-to-right
// so a decoded `\u{5c}` is never re-scanned as the start of a fresh escape.
// Without this the child-input string carries the literal escape text (`\u{8a}`
// as six characters), diverges from the path the model intended on replay, and
// the post-match branch is never taken — silently under-reporting errors.
function decodeSmtString(s: string): string {
  if (!s.includes('\\u{')) return s;
  let out = '';
  for (let i = 0; i < s.length; ) {
    if (s[i] === '\\' && s[i + 1] === 'u' && s[i + 2] === '{') {
      const close = s.indexOf('}', i + 3);
      const hex = close > i + 3 ? s.slice(i + 3, close) : '';
      const cp = /^[0-9a-fA-F]{1,6}$/.test(hex) ? parseInt(hex, 16) : NaN;
      if (cp <= 0x10ffff) {
        out += String.fromCodePoint(cp);
        i = close + 1;
        continue;
      }
    }
    out += s[i++];
  }
  return out;
}

function lex(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c <= ' ') {
      i++;
      continue;
    }
    if (c === '(' || c === ')') {
      out.push({ t: c });
      i++;
      continue;
    }
    if (c === '"') {
      i++;
      let v = '';
      while (i < s.length) {
        if (s[i] === '"') {
          if (s[i + 1] === '"') {
            v += '"';
            i += 2;
            continue;
          }
          i++;
          break;
        }
        v += s[i++];
      }
      out.push({ t: 'str', v: decodeSmtString(v) });
      continue;
    }
    let v = '';
    while (i < s.length && s[i] > ' ' && s[i] !== '(' && s[i] !== ')')
      v += s[i++];
    out.push({ t: 'atom', v });
  }
  return out;
}

type SExp = string | { str: string } | SExp[];

function parseSexp(toks: Tok[]): SExp {
  let pos = 0;
  function node(): SExp {
    const tk = toks[pos++];
    if (!tk) return [];
    if (tk.t === '(') {
      const list: SExp[] = [];
      while (toks[pos] && toks[pos].t !== ')') list.push(node());
      pos++; // consume ')'
      return list;
    }
    if (tk.t === 'str') return { str: tk.v };
    if (tk.t === 'atom') return tk.v;
    return []; // stray ')' — unreachable for well-formed z3 output
  }
  return node();
}

function valueOf(node: SExp): unknown {
  if (typeof node === 'string') {
    if (node === 'true') return true;
    if (node === 'false') return false;
    const n = Number(node);
    return Number.isNaN(n) ? node : n;
  }
  if (Array.isArray(node)) {
    const head = node[0];
    // (- N) -> negative number
    if (node.length === 2 && head === '-') {
      const inner = valueOf(node[1]);
      return typeof inner === 'number' ? -inner : inner;
    }
    // (/ p q) -> a Real model value, returned by z3 as an exact rational.
    if (node.length === 3 && head === '/') {
      const num = valueOf(node[1]);
      const den = valueOf(node[2]);
      if (typeof num === 'number' && typeof den === 'number') return num / den;
    }
    // Symbolic arrays are `(Array Int T)` now (not sequences): their model values
    // are never read as a whole `(get-value (a))` — solveModel materialises them
    // element-by-element via `(select a i)`, so valueOf only sees scalar leaves.
    return undefined; // structured value we don't model
  }
  return node.str; // string literal
}

function parseGetValue(body: string, arrayNames: string[] = []): Solution {
  const top = parseSexp(lex(body));
  const model: Solution = new Map();
  // `(select <arr> <i>)` responses, bucketed by array name then index.
  const selects = new Map<string, Map<number, unknown>>();
  if (Array.isArray(top)) {
    for (const pair of top) {
      if (!Array.isArray(pair) || pair.length !== 2) continue;
      const key = pair[0];
      if (typeof key === 'string') {
        model.set(key, valueOf(pair[1])); // scalar var
      } else if (
        Array.isArray(key) &&
        key.length === 3 &&
        key[0] === 'select' &&
        typeof key[1] === 'string'
      ) {
        const idx = Number(key[2]);
        if (!Number.isInteger(idx)) continue;
        let bucket = selects.get(key[1]);
        if (bucket === undefined) selects.set(key[1], (bucket = new Map()));
        bucket.set(idx, valueOf(pair[1]));
      }
    }
  }
  // Reassemble each symbolic array from its length var and per-index selects.
  for (const arr of arrayNames) {
    const rawLen = model.get(`${arr}_len`);
    const len = Math.max(
      0,
      Math.min(typeof rawLen === 'number' ? rawLen : 0, ARRAY_READBACK_BOUND),
    );
    const bucket = selects.get(arr);
    const built: unknown[] = [];
    for (let i = 0; i < len; i++) built.push(bucket?.get(i));
    model.set(arr, built);
  }
  return model;
}
