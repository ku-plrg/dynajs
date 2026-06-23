// Approximate JavaScript regular expression -> engine-neutral regex AST
// (`ReNode`) + capture/anchor `Sym` constraints, for the concolic String
// theory. A faithful hand-port of ExpoSE's z3javascript `Regex.js`
// (Blake Loring): the recursive-descent parser is preserved one-to-one, with
// the z3 `ctx.mkRe*`/`ctx.mkSeq*` builders rewritten onto `ReNode`/`Sym` and
// `ctx.mkStringVar` onto an injected `mint()` (so the caller owns a single
// deterministic counter -> replay re-issues the same names).
//
// Char ports: wherever the original writes a `"\xNN"` string (e.g. the `.`/range
// endpoints, `\0`), z3javascript's mkString decodes the escape to one code
// point, and `re.range` demands single-character endpoints — so here we decode
// to the actual character (`String.fromCharCode`), which `smtString` then
// renders back as `\u{..}`. ExpoSE comments are kept where they explain intent.

import { type Sym, type ReNode } from './sym.js';

export type EncodedRegex = {
  ast: ReNode; // the regex itself, for `str.in_re`
  implier: Sym; // string equal to the match when `str.in_re` holds (captures ++ anchors)
  assertions: Sym[]; // capture sub-constraints / alternation / boundary checks (always asserted)
  captures: Sym[]; // capture[0] = whole match, capture[i] = group i (fresh String vars)
  startIndex: Sym; // index the match begins at (length of the unanchored prefix)
  anchoredStart?: Sym; // the `.*` prefix filler when the regex is not `^`-anchored
  anchoredEnd?: Sym; // the `.*` suffix filler when the regex is not `$`-anchored
  backreferences: boolean;
};

// --- string helpers (module-level, no ctx) ---------------------------------

function FindClosingParen(regex: string, idx: number): number {
  let open = 1;
  while (idx < regex.length) {
    if (regex[idx - 1] != '\\' && regex[idx] == '(') open++;
    if (regex[idx - 1] != '\\' && regex[idx] == ')') open--;
    if (open == 0) return idx;
    idx++;
  }
  return -1;
}

function Desugar(regex: string): string {
  let i: number;
  // Strip ?!
  while ((i = regex.indexOf('(?!')) != -1 || (i = regex.indexOf('?=')) != -1) {
    const end = FindClosingParen(regex, i + 1);
    regex = regex.slice(0, i) + regex.slice(end + 1);
  }
  while ((i = regex.indexOf('(')) != -1 || (i = regex.indexOf(')')) != -1) {
    if (regex[i - 1] != '\\') regex = regex.slice(0, i) + regex.slice(i + 1);
  }
  // Remove word boundaries
  regex = regex.replace(/\\b|\\B/g, '');
  return regex;
}

// --- ReNode / Sym builders (the ctx.mk* surface RegexRecursive uses) --------

const reLit = (value: string): ReNode => ({ kind: 'reLit', value });
const reRange = (lo: string, hi: string): ReNode => ({
  kind: 'reRange',
  lo,
  hi,
});
const reUnion = (left: ReNode, right: ReNode): ReNode => ({
  kind: 'reUnion',
  left,
  right,
});
const reInter = (left: ReNode, right: ReNode): ReNode => ({
  kind: 'reInter',
  left,
  right,
});
const reConcat = (left: ReNode, right: ReNode): ReNode => ({
  kind: 'reConcat',
  left,
  right,
});
const reStar = (body: ReNode): ReNode => ({ kind: 'reStar', body });
const rePlus = (body: ReNode): ReNode => ({ kind: 'rePlus', body });
const reOpt = (body: ReNode): ReNode => ({ kind: 'reOpt', body });
const reComp = (body: ReNode): ReNode => ({ kind: 'reComp', body });
const reLoop = (body: ReNode, lo: number, hi: number): ReNode => ({
  kind: 'reLoop',
  body,
  lo,
  hi,
});

const sStr = (value: string): Sym => ({ kind: 'const', value });
const sInt = (value: number): Sym => ({ kind: 'const', value });
const sBool = (value: boolean): Sym => ({ kind: 'const', value });
const seqConcat = (parts: Sym[]): Sym =>
  parts.reduce((a, b) => ({ kind: 'concat', left: a, right: b }));
const seqLen = (src: Sym): Sym => ({ kind: 'strlen', src });
const inRe = (str: Sym, re: ReNode): Sym => ({ kind: 'inRe', str, re });
const eq = (a: Sym, b: Sym): Sym => ({
  kind: 'binary',
  op: '===',
  left: a,
  right: b,
});
const or = (a: Sym, b: Sym): Sym => ({
  kind: 'binary',
  op: '||',
  left: a,
  right: b,
});
const implies = (a: Sym, b: Sym): Sym => ({
  kind: 'binary',
  op: '=>',
  left: a,
  right: b,
});
const andList = (xs: Sym[]): Sym =>
  xs.length
    ? xs.reduce((a, b) => ({ kind: 'binary', op: '&&', left: a, right: b }))
    : sBool(true);

// --- the parser ------------------------------------------------------------

type ParseError = { error: string; idx: number; remaining: string };

// One recursive-descent pass over `regex` (the regexp *source*, already culled
// of `/.../` and flags). `mint()` supplies fresh String vars; it is shared
// across the nested calls below so every filler/capture name is unique.
function RegexRecursive(
  regex: string,
  startIdx: number,
  mint: () => Sym,
): EncodedRegex {
  const pp_steps: { type: string; idx: number; re?: string }[] = [];

  let idx = startIdx;
  const captures: Sym[] = [];
  const previousCaptureAst: (ReNode | null)[] = [];
  const assertions: Sym[] = [];
  let backreferences = false;

  function BuildError(msg: string): ParseError {
    return { error: msg, idx, remaining: regex.slice(idx) };
  }

  // TODO: This is a bad way of handling symbolIn, in general the whole processing fillers is weak
  let shouldAddFillerIn = true;

  function moreRange(): boolean {
    return idx < regex.length;
  }
  function more(): boolean {
    return moreRange() && current() != '|' && current() != ')';
  }
  function mk(v: string): ReNode {
    return reLit(v);
  }
  function current(): string | undefined {
    return regex.length > idx ? regex[idx] : undefined;
  }
  function next(num?: number): string | undefined {
    const r = current();
    idx += num || 1;
    return r;
  }
  function peek(num?: number): string | undefined {
    if (typeof num === 'undefined') num = 1;
    return regex[idx + num];
  }

  function Any(): ReNode {
    const beforeNewline = reRange(chr(0x00), chr(0x09));
    const afterNewline = reRange(chr(0x0b), chr(0xff));
    return reUnion(beforeNewline, afterNewline);
  }
  // The . character isnt all chracters. This will accept any character
  function TruelyAny(): ReNode {
    return reRange(chr(0x00), chr(0xff));
  }

  function ParseRangerNextEscaped(): string {
    const c1 = next()!;
    return c1 == '\\' ? next()! : c1;
  }

  function ParseRangeInner(): ReNode | undefined {
    let union: ReNode | undefined = undefined;
    while (moreRange() && current() != ']') {
      const c1 = ParseRangerNextEscaped();
      let range: ReNode;
      if (current() == '-' && peek() != ']') {
        next();
        const c2 = ParseRangerNextEscaped();
        range = reRange(c1, c2);
      } else {
        range = reLit(c1);
      }
      union = !union ? range : reUnion(union, range);
    }
    return union;
  }

  function ParseRange(): ReNode {
    next();
    let negate = false;
    if (current() == '^') {
      next();
      negate = true;
    }
    let r = ParseRangeInner()!;
    if (negate) {
      const comp = reComp(r);
      r = reInter(TruelyAny(), comp);
    }
    if (next() == ']') return r;
    throw BuildError('Regex Parsing Error (Range)');
  }

  const Specials: Record<string, () => ReNode> = { '.': Any };

  function Alpha(): ReNode {
    const p1 = reRange('a', 'z');
    const p2 = reRange('A', 'Z');
    return reUnion(p1, p2);
  }
  function Digit(): ReNode {
    return reRange('0', '9');
  }
  function Whitespace(): ReNode {
    const p1 = mk(' ');
    const p2 = mk('\t');
    const p3 = mk('\r');
    const p4 = mk('\n');
    const p5 = mk('\f');
    const p6 = mk('\v');
    return reUnion(p1, reUnion(p2, reUnion(p3, reUnion(p4, reUnion(p5, p6)))));
  }
  function AlphaNumeric(): ReNode {
    return reUnion(Alpha(), Digit());
  }
  function Word(): ReNode {
    return reUnion(AlphaNumeric(), mk('_'));
  }

  function ParseAtom1(): ReNode {
    let parsed_str = next()!;
    const IS_JUST_TEXT = /^[a-zA-Z0-9]$/;
    const IS_SPECIAL = /^[*+?]$/;
    // Hack to greedly eat anything that is definately not a special character.
    // Makes SMT formulee look prettier. We look ahead and drop back to atom-by-
    // atom parsing if the lookahead is special.
    while (
      current() &&
      IS_JUST_TEXT.test(current()!) &&
      !IS_SPECIAL.test(peek()!)
    ) {
      parsed_str += next();
    }
    return mk(parsed_str);
  }

  function ParseMaybeSpecial(): ReNode {
    if (Specials[current()!]) {
      return Specials[next()!]();
    }
    return ParseAtom1();
  }

  function isHex(char: string): boolean {
    return /^[0-9A-Fa-f]+$/.test(char);
  }

  function ParseMaybeEscaped(captureIndex: number): ReNode {
    if (current() == '\\') {
      next();
      const c = next()!;
      if (c == 'd') return Digit();
      else if (c == 'D') return reInter(TruelyAny(), reComp(Digit()));
      else if (c == 'w') return Word();
      else if (c == 'W') return reInter(TruelyAny(), reComp(Word()));
      else if (c == 's') return Whitespace();
      else if (c == 'S') return reInter(TruelyAny(), reComp(Whitespace()));
      else if (c == 'n') return mk('\n');
      else if (c == 'x') {
        const c1 = next()!;
        const c2 = next()!;
        if (!isHex(c1) || !isHex(c2))
          throw BuildError('Expected hex character at ' + c1 + ' and ' + c2);
        const hexToInt = parseInt(c1 + c2, 16);
        return mk(String.fromCharCode(hexToInt));
      } else if (c == 'u') {
        let expectingRBrace = false;
        if (current() == '{') {
          expectingRBrace = true;
          next();
        }
        const unicodeSequence = next()! + next()! + next()! + next()!;
        if (expectingRBrace && next() != '}')
          throw BuildError('Expecting RBrace in unicode sequence');
        if (!isHex(unicodeSequence))
          throw BuildError(
            'Expected digits in unicode sequence ' + unicodeSequence,
          );
        return mk(String.fromCharCode(parseInt(unicodeSequence, 16)));
      } else if (c == 'r') return mk('\r');
      else if (c == 'v') return mk('\v');
      else if (c == 't') return mk('\t');
      else if (c == 'f') return mk('\f');
      else if (c >= '1' && c <= '9') {
        const refIdx = parseInt(c);
        if (refIdx < captures.length) {
          backreferences = true;
          addToCapture(captureIndex, captures[refIdx]);
          shouldAddFillerIn = false;
          return previousCaptureAst[refIdx]!;
        }
        return mk('');
      } else if (c == 'b') {
        pp_steps.push({ type: 'b', idx });
        return mk('');
      } else if (c == 'B') {
        pp_steps.push({ type: 'B', idx });
        return mk('');
      } else if (c == '0') {
        return mk(chr(0x00));
      }
      return mk(c);
    }
    return ParseMaybeSpecial();
  }

  function ParseMaybeRange(captureIndex: number): ReNode {
    if (current() == '[') return ParseRange();
    return ParseMaybeEscaped(captureIndex);
  }

  function rewriteCaptureOptional(i: number): void {
    // Rewrite capture[n] to be capture[n] or ''
    const orFiller = mint();
    either(orFiller, captures[i], sStr(''));
    captures[i] = orFiller;
  }

  function addToCapture(i: number, thing: Sym): void {
    captures[i] = seqConcat([captures[i], thing]);
  }

  function symbolIn(atoms: ReNode): Sym {
    const nfil = mint();
    assertions.push(inRe(nfil, atoms));
    return nfil;
  }

  function ParseMaybeCaptureGroupStart(captureIndex: number): ReNode {
    function buildPlusConstraints(atoms: ReNode, plusGroup: number): ReNode {
      const ncap = captures[plusGroup];
      atoms = rePlus(atoms);
      // String = Something + Capture ^ in atoms
      const added = seqConcat([mint(), ncap]);
      assertions.push(inRe(added, atoms));
      addToCapture(captureIndex, added);
      return atoms;
    }

    function buildStarConstraints(atoms: ReNode, starGroup: number): ReNode {
      const ncap = captures[starGroup];
      atoms = reStar(atoms);
      const added = seqConcat([mint(), ncap]);
      assertions.push(implies(eq(ncap, sStr('')), eq(added, sStr(''))));
      addToCapture(captureIndex, added);
      return atoms;
    }

    if (current() == '(') {
      next();
      let capture = true;
      // Ignore ?: capture groups can't be modelled
      if (current() == '?') {
        next();
        if (current() != ':') throw BuildError('Expected : after ?');
        next();
        capture = false;
      }

      const newestCapture = captures.length;
      const atoms = ParseCaptureGroup(captureIndex, capture);

      if (next() != ')') throw BuildError('Expected ) (Capture Group Close)');

      if (capture) {
        switch (current()) {
          case '?':
          case '*': {
            // If anything the capture is optional then anything inside it is also optional
            // TODO: Take a list of originals and rewrite an implication
            // iff Len(origin) > 0 then c[i] = o[i]
            for (let i = newestCapture; i < captures.length; i++)
              rewriteCaptureOptional(i);
            buildStarConstraints(atoms, newestCapture);
            break;
          }
          case '{':
          case '+': {
            buildPlusConstraints(atoms, newestCapture);
            break;
          }
          default: {
            addToCapture(captureIndex, captures[newestCapture]);
            break;
          }
        }
      }

      shouldAddFillerIn = false;
      return atoms;
    }
    return ParseMaybeRange(captureIndex);
  }

  function ParseMaybeAssertion(captureIndex: number): ReNode {
    if (
      current() == '(' &&
      peek() == '?' &&
      (peek(2) == '!' || peek(2) == '=')
    ) {
      const end = FindClosingParen(regex, idx + 3);
      const re = regex.slice(idx + 3, end);
      pp_steps.push({ type: peek(2)!, re, idx: end + 1 });
      idx = end + 1;
    }
    return ParseMaybeCaptureGroupStart(captureIndex);
  }

  function ParseMaybePSQ(captureIndex: number): ReNode {
    let atom = ParseMaybeAssertion(captureIndex);
    if (current() == '*') {
      next();
      if (current() == '?') next();
      atom = reStar(atom);
    } else if (current() == '+') {
      next();
      if (current() == '?') next();
      atom = rePlus(atom);
    } else if (current() == '?') {
      next();
      if (current() == '?') next();
      atom = reOpt(atom);
    }
    return atom;
  }

  function digit(offset?: number): boolean {
    if (typeof offset === 'undefined') offset = 0;
    return peek(offset)! >= '0' && peek(offset)! <= '9';
  }

  function ParseNumber(): number {
    let numStr = '';
    if (!digit()) throw BuildError('Expected Digit (Parse Number)');
    while (digit()) numStr += next();
    return parseInt(numStr);
  }

  function ParseLoopCount(): [number, number | undefined] {
    const n1 = ParseNumber();
    if (current() == ',') {
      next();
      if (!digit()) {
        // Either a syntax error or a min loop, assume a min loop
        return [n1, undefined];
      }
      const n2 = ParseNumber();
      return [n1, n2];
    }
    return [n1, n1];
  }

  function ParseMaybeLoop(captureIndex: number): ReNode {
    let atom = ParseMaybePSQ(captureIndex);
    if (current() == '{' && digit(1)) {
      next();
      const [lo, hi] = ParseLoopCount();
      if (!(next() == '}')) throw BuildError('Expected } following loop count');
      // Discard any succeeding ?
      if (current() == '?') next();
      // If hi is undefined then it's a min loop {5,}
      if (hi === undefined) {
        atom = reConcat(reLoop(atom, lo, lo), reStar(atom));
      } else {
        atom = reLoop(atom, lo, hi);
      }
    }
    return atom;
  }

  function ParseMaybeAtoms(captureIndex: number): ReNode {
    let rollup: ReNode | null = null;
    while (more()) {
      while (current() == '^' || current() == '$') {
        // TODO: Find out how to handle multiline
        next();
      }
      // TODO: This is horrible, anchors should be better
      if (more()) {
        const parsed = ParseMaybeLoop(captureIndex);
        if (shouldAddFillerIn) addToCapture(captureIndex, symbolIn(parsed));
        shouldAddFillerIn = true;
        rollup = rollup ? reConcat(rollup, parsed) : parsed;
      }
    }
    return rollup || mk('');
  }

  function either(v: Sym, left: Sym, right: Sym): Sym {
    assertions.push(or(eq(v, left), eq(v, right)));
    return v;
  }

  function buildAlternationCaptureConstraints(
    captureIndex: number,
    startCaptures: number,
    endLeftCaptures: number,
    endRightCaptures: number,
    cLeft: Sym,
    cRight: Sym,
  ): void {
    const leftCaptures: Sym[] = [];
    const leftOriginals: Sym[] = [];
    const rightCaptures: Sym[] = [];
    const rightOriginals: Sym[] = [];

    for (let i = startCaptures; i < endLeftCaptures; i++) {
      leftOriginals.push(captures[i]);
      rewriteCaptureOptional(i);
      leftCaptures.push(captures[i]);
    }
    for (let i = endLeftCaptures; i < endRightCaptures; i++) {
      rightOriginals.push(captures[i]);
      rewriteCaptureOptional(i);
      rightCaptures.push(captures[i]);
    }

    const cFinal = mint();

    function buildSide(
      side: Sym,
      left: Sym[],
      original: Sym[],
      right: Sym[],
    ): void {
      const forceRightNothing = right.map((x) => eq(x, sStr('')));
      const forceLeftOriginal = left.map((x, i) => eq(left[i], original[i]));
      assertions.push(
        implies(
          eq(cFinal, side),
          andList(forceRightNothing.concat(forceLeftOriginal)),
        ),
      );
    }

    buildSide(cLeft, leftCaptures, leftOriginals, rightCaptures);
    buildSide(cRight, rightCaptures, rightOriginals, leftCaptures);

    either(cFinal, cLeft, cRight);
    captures[captureIndex] = cFinal;
  }

  function ParseMaybeOption(captureIndex: number): ReNode {
    // Track the length of captures through parsing of either side. If it
    // changes then the blocks parsed have a capture in them and will need
    // extra constraints.
    const startCaptures = captures.length;

    // The captures on an option are a bit tricky. The capture is either going
    // to be the current C0 + [Some stuff] | [Some Stuff]. So we parse one side,
    // reset the capture to cStart, then parse the other and express the final
    // constraint as an or of the two.
    const cStart = captures[captureIndex];
    captures[captureIndex] = sStr('');

    let ast = ParseMaybeAtoms(captureIndex);

    // Track the end of the left captures
    const endLeftCaptures = captures.length;
    const cLeft = captures[captureIndex];

    if (current() == '|') {
      captures[captureIndex] = sStr('');
      next();

      const ast2 = ParseMaybeOption(captureIndex);
      const cRight = captures[captureIndex];
      const endRightCaptures = captures.length;

      // If any capture groups have been defined in the alternation we need to
      // build some new string constraints on the result
      buildAlternationCaptureConstraints(
        captureIndex,
        startCaptures,
        endLeftCaptures,
        endRightCaptures,
        seqConcat([cStart, cLeft]),
        seqConcat([cStart, cRight]),
      );

      ast = reUnion(ast, ast2);
    } else {
      captures[captureIndex] = seqConcat([cStart, cLeft]);
    }

    return ast;
  }

  function ParseCaptureGroup(captureIndex: number, capture: boolean): ReNode {
    if (capture) {
      captureIndex = captures.length;
      previousCaptureAst.push(null);
      captures.push(sStr(''));
    }

    const r = ParseMaybeOption(captureIndex);

    if (capture) {
      assertions.push(inRe(captures[captureIndex], r));
      previousCaptureAst[captureIndex] = r;
    }

    return r;
  }

  let ast = ParseCaptureGroup(0, true);
  let implier = captures[0];

  let startIndex: Sym;
  let anchoredStart: Sym | undefined = undefined;
  let anchoredEnd: Sym | undefined = undefined;

  if (regex[0] !== '^') {
    anchoredStart = mint();
    ast = reConcat(reStar(TruelyAny()), ast);
    implier = seqConcat([anchoredStart, implier]);
    startIndex = seqLen(anchoredStart);
  } else {
    startIndex = sInt(0);
  }

  if (regex[regex.length - 1] !== '$') {
    anchoredEnd = mint();
    ast = reConcat(ast, reStar(TruelyAny()));
    implier = seqConcat([implier, anchoredEnd]);
  }

  // All assertions are post-processed into SMT. This is done by re-parsing a
  // desugared version of the regex and intersecting it with the AST.
  pp_steps.forEach((item) => {
    const ds_lhs = Desugar(regex.substr(0, item.idx));
    const ds_rhs = Desugar(regex.substr(item.idx));

    const lhs = RegexRecursive(ds_lhs + '$', 0, mint).ast;
    const rhs = RegexRecursive('^' + ds_rhs, 0, mint).ast;

    if (item.type == 'b' || item.type == 'B') {
      // Constants for use in query
      const any_string = reStar(TruelyAny());
      let word = Word();
      let not_word = reComp(Word());
      // If B then flip word and not word
      if (item.type == 'B') {
        const t = not_word;
        not_word = word;
        word = t;
      }
      const empty_string = mk('');

      // L = lhs in .*\W & rhs in \w.*
      const l1_w = reConcat(any_string, not_word);
      const l1 = reUnion(reInter(lhs, l1_w), empty_string);
      const l2_w = reConcat(word, any_string);
      const l2 = reInter(rhs, l2_w);
      const l = reConcat(l1, l2);

      // R - lhs in .*\w & rhs in \W.*
      const r1_w = reConcat(any_string, word);
      const r1 = reInter(lhs, r1_w);
      const r2_w = reConcat(not_word, any_string);
      const r2 = reUnion(reInter(rhs, r2_w), empty_string);
      const r = reConcat(r1, r2);

      // Assert ast intersects l | r
      ast = reInter(ast, reUnion(l, r));
    } else if (item.type == '=' || item.type == '!') {
      // Compute the asserted regex
      let assert = RegexRecursive('^' + item.re + '$', 0, mint).ast;
      assert = reConcat(assert, reStar(TruelyAny()));
      // Negate it if ?!
      if (item.type == '!') assert = reComp(assert);
      const lr = reConcat(lhs, reInter(rhs, assert));
      ast = reInter(ast, lr);
    } else {
      throw 'Currently unsupported';
    }
  });

  // Give unique names to all captures
  for (let i = 0; i < captures.length; i++) {
    const cur = captures[i];
    captures[i] = mint();
    assertions.push(eq(captures[i], cur));
  }

  return {
    ast,
    implier,
    assertions,
    captures,
    startIndex,
    anchoredStart,
    anchoredEnd,
    backreferences,
  };
}

function chr(code: number): string {
  return String.fromCharCode(code);
}

// Encode a JS regexp `source` (the `RegExp.prototype.source` string, without
// `/.../` or flags) into its z3 regex AST + capture/anchor constraints. `mint`
// yields fresh, deterministically-named String vars (the caller's counter).
// Throws a descriptive string on an unsupported construct — callers concretize.
export function encodeRegex(source: string, mint: () => Sym): EncodedRegex {
  try {
    return RegexRecursive(source, 0, mint);
  } catch (e: unknown) {
    const pe = e as Partial<ParseError>;
    throw `${pe?.error ? pe.error.toString() : '' + e} ${pe?.idx} "${pe?.remaining}" parsing regex "${source}"`;
  }
}
