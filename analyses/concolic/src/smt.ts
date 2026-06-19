import { spawnSync } from 'node:child_process';
import { type Sym, type Sort, type ReNode, isSeqSort, UnsupportedSym } from '@shared/sym.js';

// ---------------------------------------------------------------------------
// SMT-LIB translation + z3
//
// Scope: integer arithmetic, comparisons, boolean logic, a slice of the z3
// String theory — string equality, concatenation (`str.++`), fixed-window
// substring/char-access (`str.substr`), and length (`str.len`) — and the z3
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
  IntSeq: '(Seq Int)',
  StringSeq: '(Seq String)',
  BoolSeq: '(Seq Bool)',
};

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
  '=>': (a, b) => `(=> ${a} ${b})`,
  // No SMT-LIB primitive for min/max — encode via ite (used by clampInfo).
  max: (a, b) => `(ite (>= ${a} ${b}) ${a} ${b})`,
  min: (a, b) => `(ite (<= ${a} ${b}) ${a} ${b})`,
};

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
    case 'select':
      return `(seq.nth ${symToSmt(s.arr, vars)} ${symToSmt(s.index, vars)})`;
    case 'arrlen':
      return `(seq.len ${symToSmt(s.arr, vars)})`;
    case 'seqUnit':
      return `(seq.unit ${symToSmt(s.elem, vars)})`;
    case 'seqConcat':
      return `(seq.++ ${symToSmt(s.left, vars)} ${symToSmt(s.right, vars)})`;
    case 'seqExtract':
      return `(seq.extract ${symToSmt(s.src, vars)} ${symToSmt(s.offset, vars)} ${symToSmt(s.length, vars)})`;
    case 'seqIndexOf':
      return `(seq.indexof ${symToSmt(s.arr, vars)} ${symToSmt(s.sub, vars)} ${symToSmt(s.from, vars)})`;
    case 'seqContains':
      return `(seq.contains ${symToSmt(s.arr, vars)} ${symToSmt(s.sub, vars)})`;
    case 'inRe':
      return `(str.in_re ${symToSmt(s.str, vars)} ${reToSmt(s.re)})`;
    case 'ite':
      return `(ite ${symToSmt(s.cond, vars)} ${symToSmt(s.then, vars)} ${symToSmt(s.else, vars)})`;
    case 'lost':
      // Defensive: branches drop `lost` constraints and asserts concretize over
      // them, so a `lost` should never reach the solver — if one does, refuse to
      // translate rather than fabricate (caller -> `error`).
      throw new UnsupportedSym('information lost: symbolic value through an unmodeled op');
  }
}

// ---------------------------------------------------------------------------

// A branch taken during concrete execution, as fed to the solver: the symbolic
// condition and the concrete direction it went.
export type Polarized = { constraint: Sym; taken: boolean };

// A satisfying assignment: each symbolic variable -> its concrete model value.
export type Solution = Map<string, unknown>;

// Assemble the SMT-LIB problem. The String/Sequence theories need an explicit
// logic; the all-Int path stays bare so existing integer benches translate
// byte-for-byte.
function buildSmt(vars: Map<string, Sort>, assertions: string[], tail: string): string {
  const needsLogic = [...vars.values()].some((s) => s === 'String' || isSeqSort(s));
  return (
    (needsLogic ? '(set-logic ALL)\n' : '') +
    [...vars].map(([v, sort]) => `(declare-const ${v} ${SORT_SMT[sort]})`).join('\n') +
    '\n' +
    assertions.join('\n') +
    '\n' +
    tail +
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
  if (r.error) throw new UnsupportedSym(`z3 invocation failed: ${r.error.message}`);
  const out = (r.stdout ?? '').trim();
  if (out.length === 0) {
    throw new UnsupportedSym(`z3 produced no output: ${(r.stderr ?? '').trim()}`);
  }
  return out;
}

// Translate a path condition to polarized assertions, collecting its variables.
function assertPath(pc: readonly Polarized[], vars: Map<string, Sort>): string[] {
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
  const out = runZ3(buildSmt(vars, assertions, '(check-sat)'));
  if (out.startsWith('unsat')) return 'valid';
  if (out.startsWith('sat')) return 'invalid';
  return 'unknown';
}

// Is the path condition satisfiable, and if so, what concrete inputs realise it?
// Returns the satisfying assignment for every variable that appears, or null
// when unsat / unknown / variable-free. The model-extraction counterpart to
// solveValidity: alternatives() negates one branch and reads back a child input.
export function solveModel(pc: readonly Polarized[]): Solution | null {
  const vars = new Map<string, Sort>();
  const assertions = assertPath(pc, vars);
  if (vars.size === 0) return null; // no symbol -> no input to derive
  const names = [...vars.keys()];
  const out = runZ3(
    buildSmt(vars, assertions, `(check-sat)\n(get-value (${names.join(' ')}))`),
  );
  if (!out.startsWith('sat')) return null; // unsat or unknown
  return parseGetValue(out.slice(out.indexOf('\n') + 1));
}

// --- z3 (get-value) response parser ----------------------------------------
// z3 answers `(get-value (v...))` with `((v1 val1) (v2 val2) ...)` where each
// val is a leaf form we emit (constToSmt's inverse): an Int atom (`5`) or its
// negation (`(- 3)`), a String literal (`"x"`, `""`-escaped), or a Bool
// (`true`/`false`). Tokenize (strings atomic, `""` -> `"`), parse to nested
// lists, then read each (name value) pair.

type Tok = { t: '(' | ')' } | { t: 'str'; v: string } | { t: 'atom'; v: string };

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
      out.push({ t: 'str', v });
      continue;
    }
    let v = '';
    while (i < s.length && s[i] > ' ' && s[i] !== '(' && s[i] !== ')') v += s[i++];
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
    // (- N) -> negative number
    if (node.length === 2 && node[0] === '-') {
      const inner = valueOf(node[1]);
      return typeof inner === 'number' ? -inner : inner;
    }
    return undefined; // structured value we don't model
  }
  return node.str; // string literal
}

function parseGetValue(body: string): Solution {
  const top = parseSexp(lex(body));
  const model: Solution = new Map();
  if (Array.isArray(top)) {
    for (const pair of top) {
      if (Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string') {
        model.set(pair[0], valueOf(pair[1]));
      }
    }
  }
  return model;
}
