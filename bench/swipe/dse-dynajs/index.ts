// SWIPE DSE on DynaJS (option B): a FlowAnalysis over symbolic expressions.
//
// How values flow through operators and built-in calls (substring, indexOf,
// split, includes, replace, ...) comes from DynaJS's spec-derived built-in models,
// which call the transfer functions below; this file only says what a symbolic
// value *is* for SWIPE (an SMT term over `search`/`hash`) and when to talk to
// SWIPE's constraint server:
//   - sources: location.search / location.hash / location.href
//   - sinks:   document.write, document.writeln, eval, and innerHTML writes (PSE's list)
//   - one `chose_value` per symbolic branch, in user code or inside a model
//     (including the loop-range guards of spec algorithms), `Found XSS`, and
//     `page_init` / `onload` — SWIPE's message protocol on localhost:8307.
// Built-ins DynaJS does not model run natively (opaque); for those, the PSE
// hand-written model is the fallback where PSE has one (see PSE_FALLBACK).
// SWIPE's solver declares exactly two string variables, `search` and `hash`.
import { FlowAnalysis, type Valued } from '../../../analyses/flow/index.js';
import { type Sym, type Sort, sortOf, sortsComparable, isNumericSort } from '../../../analyses/concolic/src/sym.js';
import { symToSmt } from '../../../analyses/concolic/src/smt.js';

declare const D$: { analysis: unknown } & Record<string, any>;

// captured before any page script runs
const LOC = window.location;
const DOC = document;
const SINKS = new Set<unknown>([DOC.write, DOC.writeln, window.eval]);
const XHR = window.XMLHttpRequest;
const stringify = JSON.stringify;
const SERVER = 'https://localhost:8307/';
const INPUT_VARS = new Set(['search', 'hash']);
const EQUALITY_OPS = new Set(['===', '==', '!==', '!=']);
const SetHas = Function.prototype.call.bind(Set.prototype.has) as (s: Set<unknown>, v: unknown) => boolean;

// PSE models for built-ins DynaJS has no spec model for (RegExp methods and the
// case maps run natively). Ported from PSE's pse/models:
//   toLowerCase/toUpperCase -> identity on the symbolic string (PSE's model)
//   RegExp.prototype.test   -> (str.in.re s RE), RE from SWIPE's regex-to-SMT
//                              service on localhost:9222 (re2smtlib.js), as PSE
//   RegExp.prototype.exec   -> a `regexcase` message (PSE logs it; SWIPE's server
//                              then asks for `search` containing the pattern's words)
// Not ported: PSE's String search / global match / split-with-RegExp models.
const ArrayIsArray = Array.isArray;
const SKIP_MODEL_MAX_LEN = 4096;
const RE_TEST = RegExp.prototype.test;
const RE_EXEC = RegExp.prototype.exec;
const RE_TO_STRING = Function.prototype.call.bind(RegExp.prototype.toString) as (re: RegExp) => string;
const PSE_FALLBACK = new Map<unknown, string>([
  [String.prototype.toLowerCase, 'identity'],
  [String.prototype.toUpperCase, 'identity'],
  [String.prototype.toLocaleLowerCase, 'identity'],
  [String.prototype.toLocaleUpperCase, 'identity'],
  [RE_TEST, 'regex-test'],
  [RE_EXEC, 'regex-exec'],
]);
const RE_TRANSLATOR = 'http://localhost:9222/';

// Ablation build (build-browser.mjs: dse-dynajs-nofb.js): no PSE fallback, so
// built-ins DynaJS does not model stay concrete like any other opaque call.
declare const __DYNAJS_NO_FALLBACK: boolean | undefined;
const NO_FALLBACK = typeof __DYNAJS_NO_FALLBACK !== 'undefined' && __DYNAJS_NO_FALLBACK;

// Debug build only (build-browser.mjs --trace): every TRACE_EVERY calls, POST
// what the analysis has been doing (hot callees, sampled call sites, heap) to a
// log server, synchronously, so a page stuck in a loop still reports.
declare const __DYNAJS_TRACE: string | undefined;
const TRACE = typeof __DYNAJS_TRACE !== 'undefined' ? __DYNAJS_TRACE : undefined;
const TRACE_MS = 3000;
const tr = { n: 0, t0: Date.now(), last: 0, fns: new Map<string, number>(), sites: new Map<string, number>() };
const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
const top = (m: Map<string, number>, k: number) => [...m].sort((a, b) => b[1] - a[1]).slice(0, k);
function tracePost(body: object): void {
  try {
    const xhr = new XHR();
    xhr.open('POST', TRACE!, false);
    xhr.send(stringify(body));
  } catch {}
}
/** kind: hook name, or the callee's name for calls */
function traceTick(id: number, kind: string, extra: () => object): void {
  tr.n++;
  bump(tr.fns, kind);
  if (tr.n % 200 === 0) {
    // page-code frames of the current stack: drop frames of the injected
    // runtime + analysis (same URL as the page, lines up to INJ_END)
    const lim = (Error as any).stackTraceLimit;
    (Error as any).stackTraceLimit = 80;
    const raw = String(new Error().stack);
    (Error as any).stackTraceLimit = lim;
    const st = raw.split('\n').slice(1).filter((l) => {
      const m = /\((.*):(\d+):\d+\)$|at (.*):(\d+):\d+$/.exec(l);
      if (!m) return false;
      const url = m[1] ?? m[3];
      const line = Number(m[2] ?? m[4]);
      return !(url === PAGE_URL && line <= INJ_END);
    }).slice(0, 4).map((l) => l.trim().replace(/^at /, '').slice(0, 160)).join(' <- ');
    bump(tr.sites, st);
  }
  if (tr.n % 1000 !== 0) return;
  const now = Date.now();
  if (now - tr.last < TRACE_MS) return;
  tr.last = now;
  const mem = (performance as any).memory;
  tracePost({ href: LOC.href, n: tr.n, ms: now - tr.t0, heapMB: mem ? Math.round(mem.usedJSHeapSize / 1e6) : -1,
    fns: top(tr.fns, 25), sites: top(tr.sites, 15), ...extra() });
  tr.fns.clear(); tr.sites.clear();
}
const PAGE_URL = LOC.href;
let INJ_END = 0;
if (TRACE) tracePost({ hello: LOC.href });

const reCache = new Map<string, string | undefined>();
/** SMT-LIB regex for a JS RegExp via SWIPE's translator (PSE's ReTranslator). */
function translateRegex(re: RegExp): string | undefined {
  const src = RE_TO_STRING(re);
  if (reCache.has(src)) return reCache.get(src);
  let out: string | undefined;
  try {
    const xhr = new XHR();
    xhr.open('POST', RE_TRANSLATOR, false); // synchronous, as PSE
    xhr.send(src + '\n\n');
    const text = xhr.responseText.trim();
    if (xhr.status === 200 && text.startsWith('(')) out = text;
  } catch {
    /* no translator: the call stays concrete */
  }
  reCache.set(src, out);
  return out;
}

// A raw SMT-LIB term stands in the Sym tree as a Bool variable `__rawN`;
// toSwipeSmt splices the text back in. Built only over SWIPE's input variables.
const rawTerms = new Map<string, string>();
function rawSym(smt: string): Sym {
  const name = `__raw${rawTerms.size}_`; // `_` ends the name: __raw1_ is not inside __raw11_
  rawTerms.set(name, smt);
  return { kind: 'var', name, sort: 'Bool' };
}

const href0 = LOC.href;
const constantPart = href0.slice(0, href0.length - LOC.search.length - LOC.hash.length);

function send(type: string, message: unknown): void {
  try {
    const xhr = new XHR();
    xhr.open('POST', SERVER);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(stringify({ type: 'constraint', body: { type, message, time: new Date().toISOString() } }));
  } catch {
    /* logging must never break the page */
  }
}

const searchVar: Sym = { kind: 'var', name: 'search', sort: 'String' };
const hashVar: Sym = { kind: 'var', name: 'hash', sort: 'String' };
const hrefSym: Sym = {
  kind: 'concat',
  left: { kind: 'concat', left: { kind: 'const', value: constantPart }, right: searchVar },
  right: hashVar,
};

type Info = Sym | undefined;

/** SMT-LIB term over SWIPE's input variables only, or undefined. */
function toSwipeSmt(s: Sym): string | undefined {
  const vars = new Map<string, Sort>();
  let smt: string;
  try {
    smt = symToSmt(s, vars);
  } catch {
    return undefined;
  }
  if (vars.size === 0) return undefined;
  for (const v of vars.keys()) {
    const raw = rawTerms.get(v);
    if (raw !== undefined) smt = smt.split(v).join(raw);
    else if (!SetHas(INPUT_VARS, v)) return undefined;
  }
  return smt;
}

/** SMT text of a symbolic string over SWIPE's inputs only, or undefined. */
function inputSmt(s: Sym | undefined): string | undefined {
  return s === undefined ? undefined : toSwipeSmt(s);
}

const constOf = (v: Valued<Info>): Sym => v.info ?? { kind: 'const', value: v.value };

class SwipeDSE extends FlowAnalysis<Info> {
  domain = {
    getBottom: (): Info => undefined,
    isBottom: (info: Info): info is undefined => info === undefined,
  };
  // Run shift/unshift natively: through the spec model a queue drained with
  // shift() is quadratic and kept pages from loading.
  protected transparentCalls: ReadonlySet<unknown> = new Set<unknown>([
    Array.prototype.shift,
    Array.prototype.unshift,
  ]);
  // Symbolic values get their info when created (sources, transfer functions),
  // never later, so concrete primitives need no wrapper.
  protected liftBottomPrimitives = false;
  private sentChoices = new Set<string>();

  // A modeled builtin whose inputs are all concrete -- primitives, or real
  // Arrays holding only primitives -- yields the same value natively, and its
  // model would record no symbolic branch. Without this, `[10,13,32].includes(x)`
  // in an interpreter loop or `t.includes(k) || t.push(k)` key dedup runs the
  // spec algorithm element by element and pages miss SWIPE's load limit.
  // Calls with a callback keep the model (native code would ToBoolean a lifted
  // callback result).
  protected skipModel(_f: unknown, entries: unknown[]): boolean {
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (typeof e === 'function') return false;
      if (e === null || typeof e !== 'object') continue;
      if (this.isPrimitiveProxy(e) || !this.domain.isBottom(this.getInfo(e))) return false;
      if (!ArrayIsArray(e)) return false;
      const n = (e as unknown[]).length;
      if (n > SKIP_MODEL_MAX_LEN) return false;
      for (let k = 0; k < n; k++) {
        const x = (e as unknown[])[k];
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) return false;
      }
    }
    return true;
  }
  stats = { branches: 0, sent: 0, skipped: 0, fallback: 0, unmodeled: {} as Record<string, number> };

  // ---- transfer functions: Sym construction (as in DynaJS's concolic analysis) ----

  protected defaultInfo(): Info {
    return undefined;
  }

  protected substringInfo(src: Valued<Info>, start: Valued<Info, number>, end: Valued<Info, number>, resultLength: number): Info {
    if (src.info === undefined) return undefined;
    if (start.info === undefined && end.info === undefined)
      return { kind: 'substr', src: src.info, start: start.value, length: resultLength };
    const s = constOf(start);
    return { kind: 'substr', src: src.info, start: s, length: { kind: 'binary', op: '-', left: constOf(end), right: s } };
  }

  protected concatenateInfo(left: Valued<Info>, _ll: number, right: Valued<Info>, _rl: number): Info {
    const l = constOf(left);
    const r = constOf(right);
    if (l.kind === 'const' && r.kind === 'const') return undefined;
    return { kind: 'concat', left: l, right: r };
  }

  // trim needs ExpoSE's str.whiteLeft/Right helpers, which SWIPE's preamble
  // lacks: the trimmed string stays concrete (as in PSE, which has no trim model)
  protected trimInfo(): Info {
    return undefined;
  }

  protected binaryInfo(op: string, l: Valued<Info>, r: Valued<Info>): Info {
    const left = constOf(l);
    let right = constOf(r);
    const eq = SetHas(EQUALITY_OPS, op);
    if (eq && typeof l.value === 'string' && typeof r.value !== 'string')
      right = { kind: 'const', value: String(r.value) };
    if (left.kind === 'const' && right.kind === 'const') return undefined;
    if (eq) {
      const ls = sortOf(left);
      const rs = sortOf(right);
      if (ls !== undefined && rs !== undefined && !sortsComparable(ls, rs)) return undefined;
    }
    return { kind: 'binary', op, left, right };
  }

  protected unaryInfo(op: string, x: Valued<Info>): Info {
    const operand = constOf(x);
    return operand.kind === 'const' ? undefined : { kind: 'unary', op, operand };
  }

  protected lengthOfStringInfo(s: Valued<Info>): Info {
    const src = constOf(s);
    return src.kind === 'const' ? undefined : { kind: 'strlen', src };
  }

  protected containsStrInfo(s: Valued<Info>, sub: Valued<Info>): Info {
    const str = constOf(s);
    const needle = constOf(sub);
    if (str.kind === 'const' && needle.kind === 'const') return undefined;
    if (sortOf(str) !== 'String' || sortOf(needle) !== 'String') return undefined;
    return { kind: 'contains', str, sub: needle };
  }

  protected truncateInfo(x: Valued<Info>): Info {
    const src = constOf(x);
    return src.kind === 'const' ? undefined : { kind: 'truncate', src };
  }

  protected clampInfo(x: Valued<Info>, lower: Valued<Info>, upper: Valued<Info>): Info {
    const xs = constOf(x);
    const lo = constOf(lower);
    const hi = constOf(upper);
    if (xs.kind === 'const' && lo.kind === 'const' && hi.kind === 'const') return undefined;
    return minMax('max', lo, minMax('min', xs, hi));
  }

  protected minInfo(operands: Valued<Info, number>[]): Info {
    return extremum('min', operands);
  }

  protected maxInfo(operands: Valued<Info, number>[]): Info {
    return extremum('max', operands);
  }

  // A spec loop `for i in [lo, hi]`: index i is lo + k. If hi is symbolic, the
  // trip count is an input-dependent branch — "could the loop run once more?".
  // When the needle of indexOf/includes is longer than the input this guard is
  // the only constraint at all, so it goes to SWIPE like any other branch.
  protected rangeInfo(
    indices: number[],
    lo: Valued<Info, number>,
    loInclusive: boolean,
    hi: Valued<Info, number>,
    hiInclusive: boolean,
  ): Info[] {
    const hiSym = constOf(hi);
    if (hiSym.kind !== 'const') {
      const next = indices.length ? indices[indices.length - 1] + 1 : lo.value + (loInclusive ? 0 : 1);
      this.emit({ kind: 'binary', op: hiInclusive ? '<=' : '<', left: { kind: 'const', value: next }, right: hiSym }, false);
    }
    const loSym = constOf(lo);
    if (loSym.kind === 'const') return indices.map(() => undefined);
    return indices.map((i) =>
      i === lo.value ? loSym : { kind: 'binary', op: '+', left: loSym, right: { kind: 'const', value: i - lo.value } },
    );
  }

  // every symbolic branch, in user code or inside a built-in model
  protected conditionInfo(_id: number, cond: Valued<Info>, taken: boolean): void {
    const sym = constOf(cond);
    if (sym.kind === 'const') return;
    const bool = toBool(sym);
    if (bool !== undefined) this.emit(bool, taken);
  }

  // built-ins without a DynaJS model: PSE's model if there is one, else the
  // result is concrete (PSE likewise concretizes unmodeled calls)
  protected opaqueCallInfo(f: unknown, entries: unknown[], _result: unknown): Info {
    const symbolic = entries.some((e) => this.valued(e).info !== undefined);
    if (!symbolic) return undefined;
    const model = NO_FALLBACK ? undefined : PSE_FALLBACK.get(f);
    if (model === 'identity') {
      this.stats.fallback++;
      return this.valued(entries[0]).info;
    }
    if (model === 'regex-test' || model === 'regex-exec') {
      // entries = [regexp (this), string]; PSE models only a concrete RegExp
      const re = this.valued(entries[0]).value;
      const str = inputSmt(this.valued(entries[1]).info);
      if (re instanceof RegExp && str !== undefined) {
        this.stats.fallback++;
        if (model === 'regex-exec') {
          send('regexcase', { function: 'exec', pattern: RE_TO_STRING(re) });
          return undefined;
        }
        const reSmt = translateRegex(re);
        if (reSmt !== undefined) return rawSym(`(str.in.re ${str} ${reSmt})`);
      }
    }
    const name = typeof f === 'function' ? f.name || '?' : String(f);
    this.stats.unmodeled[name] = (this.stats.unmodeled[name] ?? 0) + 1;
    return undefined;
  }

  // ---- SWIPE glue ----

  getField(id: number, base: any, prop: any, result: any, isPrivate: boolean, frame: unknown) {
    if (TRACE) traceTick(id, 'getField', () => ({ stats: this.stats, sent: this.sentChoices.size }));
    const out = super.getField(id, base, prop, result, isPrivate, frame);
    if (this.valued(base).value === LOC) {
      const p = this.valued(prop).value;
      if (p === 'search' || p === 'hash' || p === 'href') {
        const raw = this.valued(out ? out.result : result).value as string;
        return { result: this.lift(raw, p === 'search' ? searchVar : p === 'hash' ? hashVar : hrefSym) };
      }
    }
    return out;
  }

  /** One branch -> one `chose_value` (the side taken), deduplicated; the
   *  server negates it under the choices sent before it. */
  private emit(constraint: Sym, taken: boolean): void {
    this.stats.branches++;
    const smt = toSwipeSmt(constraint);
    if (smt === undefined) {
      this.stats.skipped++;
      return;
    }
    const choice = taken ? smt : `(not ${smt})`;
    if (SetHas(this.sentChoices, choice)) return;
    this.sentChoices.add(choice);
    this.stats.sent++;
    send('chose_value', { smt: choice, reason: 'branch' });
  }

  private checkSink(arg: unknown): void {
    const s = this.valued(arg).info;
    if (s === undefined || toSwipeSmt(s) === undefined) return;
    send('Found XSS', { href: LOC.href, host: LOC.hostname });
  }

  invokeFunPre(id: number, f: any, base: any, args: any, isCtor: boolean, isMethod: boolean) {
    if (TRACE) {
      const fv = this.valued(f).value;
      traceTick(id, 'call:' + (typeof fv === 'function' ? fv.name || '(anon)' : typeof fv), () => ({ stats: this.stats, sent: this.sentChoices.size }));
    }
    if (SetHas(SINKS, this.valued(f).value) && args && args.length > 0) this.checkSink(args[0]);
    return super.invokeFunPre(id, f, base, args, isCtor, isMethod);
  }

  condition(id: number, op: string, value: unknown) {
    if (TRACE) traceTick(id, 'condition', () => ({ stats: this.stats, sent: this.sentChoices.size }));
    return super.condition(id, op, value);
  }

  binaryPre(id: number, op: string, left: any, right: any) {
    if (TRACE) traceTick(id, 'binary' + op, () => ({ stats: this.stats, sent: this.sentChoices.size }));
    return super.binaryPre(id, op, left, right);
  }

  // PSE's setField model also reports a symbolic value written to innerHTML
  putFieldPre(id: number, base: any, prop: any, value: any) {
    if (this.valued(prop).value === 'innerHTML') this.checkSink(value);
    return super.putFieldPre(id, base, prop, value);
  }

  instrumentCodePre(id: number, code: any, isDirect: boolean) {
    this.checkSink(code); // direct eval goes through D$.Ev, not invokeFun
    return super.instrumentCodePre(id, code, isDirect);
  }
}

function toBool(sym: Sym): Sym | undefined {
  const sort = sortOf(sym);
  if (sort === 'Bool') return sym;
  if (sort === 'String') return { kind: 'binary', op: '!==', left: sym, right: { kind: 'const', value: '' } };
  if (isNumericSort(sort)) return { kind: 'binary', op: '!==', left: sym, right: { kind: 'const', value: 0 } };
  return undefined;
}

function minMax(op: 'min' | 'max', a: Sym, b: Sym): Sym {
  const inf = (s: Sym) => (s.kind === 'const' && typeof s.value === 'number' && !Number.isFinite(s.value) ? s.value : undefined);
  const av = inf(a);
  if (av !== undefined) return (op === 'min') === (av === Infinity) ? b : a;
  const bv = inf(b);
  if (bv !== undefined) return (op === 'min') === (bv === Infinity) ? a : b;
  return { kind: 'binary', op, left: a, right: b };
}

function extremum(op: 'min' | 'max', operands: Valued<Info, number>[]): Info {
  const syms = operands.map(constOf);
  if (syms.every((s) => s.kind === 'const')) return undefined;
  return syms.reduce((l, r) => minMax(op, l, r));
}

const analysis = new SwipeDSE();
// trace build: also tick inside the spec-model runtime ($.*) and the boundary
// escape, which run without engine hooks — a page stuck in a model loop or an
// escape walk would otherwise go silent
if (TRACE) {
  const extra = () => ({ stats: analysis.stats });
  const rt = analysis.$ as unknown as Record<string, unknown>;
  for (const k of Object.keys(rt)) {
    const fn = rt[k];
    if (typeof fn !== 'function') continue;
    rt[k] = function traced(this: unknown, ...a: unknown[]) {
      traceTick(-1, '$.' + k, extra);
      return (fn as Function).apply(this, a);
    };
  }
  const esc = (analysis as any).escaper;
  for (const k of ['escape', 'restore', 'wrapForOperator']) {
    const fn = esc[k];
    esc[k] = function traced(this: unknown, ...a: unknown[]) {
      traceTick(-1, 'escaper.' + k, extra);
      return fn.apply(this, a);
    };
  }
}
if (TRACE) {
  const m = /:(\d+):\d+\)?$/.exec(String(new Error().stack).split('\n')[1] ?? '');
  INJ_END = m ? Number(m[1]) + 200 : 0;
  tracePost({ injEnd: INJ_END });
}
D$.analysis = analysis;
(globalThis as any).__swipeDSE = analysis; // for debugging / the harness

send('page_init', { href: LOC.href, constantPart, host: LOC.hostname });
DOC.addEventListener(
  'readystatechange',
  () => {
    if (DOC.readyState === 'complete') send('onload', `@@@loading finished@@@ <url>${LOC.host}${LOC.pathname}</url>`);
  },
  false,
);
