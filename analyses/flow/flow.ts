import util from 'node:util';
import { required } from './utils.js';
import type { Analysis } from '@/types/analysis.js';
import type { SpecRuntime, Lifted, Unlifted, Primitive } from './type.js';
import { Model } from './model.js';
import {
  type Site,
  UNKNOWN_SITE,
  resolveCodeSite,
  builtinName,
} from './site.js';
import { BoundaryEscape, type EscapeRecord } from './escape.js';
import { AO__CanonicalNumericIndexString } from './spec/index.js';

type ValuedGeneral<Shape extends {}, Value = unknown> = Shape & {
  value: Value;
};

type IdValuePair = ValuedGeneral<{ id: symbol }, unknown>;

// `instanceof` and `in` are type/membership predicates, not value-algebra
// operators: the boolean they yield is decided by the prototype chain / property
// table, never by a modelable function of the operands' values. The op-aware
// `binaryInfo` hook is for value ops, so the framework does not route these to it
// — their result carries only operand provenance (baseInfo). Without this an
// op-aware analysis would forge a `{binary, instanceof, …}` symbol no solver can
// translate, which (for concolic) poisons the path condition.
const NON_VALUE_BINARY_OPS = new Set(['instanceof', 'in']);

type BinFrame = { ty: 'bin'; op: string; left: Lifted; right: Lifted };
type UnFrame = { ty: 'un'; op: string; operand: Lifted };
type GetFieldFrame = { ty: 'getField'; base: Lifted; prop: Lifted };

type CallFrame = OpaqueCall | TransparentCall;
type OpaqueCall = {
  ty: 'opaque';
  f: unknown;
  modeled: boolean;
  entries: unknown[];
  escaped: EscapeRecord[];
};
type TransparentCall = { ty: 'transparent'; entries: unknown[] };

function isInstrumentedFn(f: unknown): boolean {
  const d$ = (
    globalThis as { D$?: { isInstrumented?: (f: unknown) => boolean } }
  ).D$;
  return d$?.isInstrumented?.(f) ?? false;
}

export type Valued<Info, Value = unknown> = ValuedGeneral<
  { info: Info | undefined },
  Value
>;

export type InfoDomain<Info> = {
  getBottom: () => Info;
  isBottom: (info: Info) => boolean;
};

export type CallPolicy = {
  isOpaque: (f: unknown) => boolean;
};

// `regex.exec(s)` whose result carries per-capture spans (`match.indices`): the
// `d`/hasIndices flag (ES2022) is what produces them, so add it when absent —
// on a temporary copy, since re-adding `d` is a SyntaxError — while preserving
// lastIndex so /g//y iteration is unaffected. Spans let captures be recovered as
// substrings of the subject (offset-precise provenance).
function execWithIndices(regex: RegExp, s: string): RegExpExecArray | null {
  if (regex.hasIndices) return regex.exec(s);
  const withIndices = new RegExp(regex.source, regex.flags + 'd');
  withIndices.lastIndex = regex.lastIndex;
  const match = withIndices.exec(s);
  regex.lastIndex = withIndices.lastIndex;
  return match;
}

export abstract class FlowAnalysis<Info> implements Analysis {
  private primitiveWrapper = new WeakSet<object>();
  private valueMap = new WeakMap<object, IdValuePair>();
  private infoMap = new Map<symbol, Info>();

  private currentId: number | undefined = undefined;
  private currentBuiltin: string | undefined = undefined;

  private escaper = new BoundaryEscape(
    this.isPrimitiveProxy.bind(this),
    this.unwrap.bind(this),
  );

  protected site(): Site {
    if (this.currentBuiltin !== undefined) {
      const call =
        this.currentId !== undefined
          ? resolveCodeSite(this.currentId)
          : UNKNOWN_SITE;
      return {
        kind: 'builtin',
        name: this.currentBuiltin,
        call: call.kind === 'code' ? call : undefined,
      };
    }
    if (this.currentId !== undefined) return resolveCodeSite(this.currentId);
    return UNKNOWN_SITE;
  }

  private withBuiltinSite<T>(name: string, body: () => T): T {
    const savedBuiltin = this.currentBuiltin;
    this.currentBuiltin = name;
    try {
      return body();
    } finally {
      this.currentBuiltin = savedBuiltin;
    }
  }

  abstract domain: InfoDomain<Info>;

  protected transparentCalls: ReadonlySet<unknown> = new Set();

  policy: CallPolicy = {
    isOpaque: (f) =>
      typeof f === 'function' &&
      !isInstrumentedFn(f) &&
      !this.transparentCalls.has(f),
  };

  protected abstract baseInfo(value: unknown, parents: Valued<Info>[]): Info;

  protected substringInfo?(
    _src: Valued<Info, string>,
    _start: Valued<Info, number>,
    _end: Valued<Info, number>,
    _resultLength: number,
  ): Info;
  protected concatenateInfo?(
    _left: Valued<Info, string>,
    _leftLength: number,
    _right: Valued<Info, string>,
    _rightLength: number,
  ): Info;
  protected lengthOfStringInfo?(_src: Valued<Info, string>): Info;
  /* case folding (`$.toLower`/`$.toUpper`): no z3 string operator maps case, so an
   * analysis cannot encode the per-character mapping — return a model under which
   * the fold is observable (concolic: identity on a single-case path), or undefined
   * to fall through to baseInfo. */
  protected toLowerInfo?(_src: Valued<Info, string>): Info;
  protected toUpperInfo?(_src: Valued<Info, string>): Info;

  protected binaryInfo?(
    _op: string,
    _left: Valued<Info>,
    _right: Valued<Info>,
  ): Info;
  protected unaryInfo?(_op: string, _operand: Valued<Info>): Info;
  protected truncateInfo?(_src: Valued<Info, number>): Info;
  /* clamp(x, lower, upper) = max(lower, min(x, upper)) */
  protected clampInfo?(
    _x: Valued<Info, number>,
    _lower: Valued<Info, number>,
    _upper: Valued<Info, number>,
  ): Info;

  /* one index of an integer range `lo..hi`; called per element so the analysis can
   * tie each index to the (possibly symbolic) bounds. `bid` keys the loop-bound branch. */
  protected rangeInfo?(
    _index: number,
    _lo: Valued<Info, number>,
    _loInclusive: boolean,
    _hi: Valued<Info, number>,
    _hiInclusive: boolean,
    _ascending: boolean,
    _bid: number,
  ): Info;

  /* property read from object property or array element */
  protected getFieldInfo?(
    _base: Valued<Info>,
    _prop: Valued<Info>,
    _result: Valued<Info>,
  ): Info;

  protected conditionInfo?(
    _id: number,
    _cond: Valued<Info>,
    _taken: boolean,
  ): void {}

  protected escapedInfo?(_f: unknown, _escaped: Valued<Info>[]): void {}

  /* opaque call the analysis wants to model */
  protected opaqueCallInfo?(
    _f: unknown,
    _entries: unknown[],
    _result: unknown,
  ): Info;

  /* regex match (via the `$.regexExec` primitive): the symbolic projection of
   * matching `regex` against `string`. `result` is the native exec result
   * (array | null); return the per-field Info (matched / start index / per-
   * capture), or undefined to fall through to baseInfo. */
  protected regexExecInfo?(
    _regex: Valued<Info, RegExp>,
    _string: Valued<Info, string>,
    _result: unknown,
  ): { matched: Info; index: Info; captures: Info[] } | undefined;

  // ---- Info storage helpers ----

  protected /* final */ getInfo(value: unknown): Info {
    const e = this.getEntry(value);
    return e === undefined
      ? this.domain.getBottom()
      : (this.infoMap.get(e.id) ?? this.domain.getBottom());
  }

  protected setInfo(value: unknown, info: Info): void {
    const e = this.getEntry(value);
    if (e === undefined) return;
    this.infoMap.set(e.id, info);
  }

  protected getOrCreateInfo(value: unknown, makeEmpty: () => Info): Info {
    const e = this.getEntry(value);
    if (e === undefined) return this.domain.getBottom();
    let info = this.infoMap.get(e.id);
    if (info === undefined) {
      info = makeEmpty();
      this.infoMap.set(e.id, info);
    }
    return info;
  }

  protected valued<V>(v: V): Valued<Info, V> {
    return {
      info: this.getInfo(v) satisfies Info,
      value: this.unwrap(v as Lifted<V>),
    } satisfies Valued<Info, V>;
  }

  /* dual of `valued` */
  protected make<V>(
    value: V,
    info: Info = this.domain.getBottom(),
  ): Lifted<V> {
    return this.lift(value, info);
  }

  private lift<T>(value: T, info: Info): Lifted<T> {
    const w = this.wrap(value);
    /* Bottom carries no information, so skip */
    if (!this.domain.isBottom(info)) this.setInfo(w, info);
    return w;
  }

  /** internal(flow.ts) */
  private numOp(v: number, parents: Lifted<unknown>[]): Lifted<number> {
    return this.lift(
      v,
      this.baseInfo(
        v,
        parents.map((p) => this.valued(p)),
      ),
    );
  }

  /** internal(flow.ts) */
  private binOp(
    op: string,
    l: Lifted<number>,
    r: Lifted<number>,
    v: number,
  ): Lifted<number> {
    return this.lift(
      v,
      this.binaryInfo?.(op, this.valued(l), this.valued(r)) ??
        this.baseInfo(v, [this.valued(l), this.valued(r)]),
    );
  }

  /** internal(flow.ts) */
  private unOp(op: string, x: Lifted<number>, v: number): Lifted<number> {
    return this.lift(
      v,
      this.unaryInfo?.(op, this.valued(x)) ??
        this.baseInfo(v, [this.valued(x)]),
    );
  }

  /** internal(flow.ts) — operands are Wrapped<unknown>: ordering comparisons pass
   * numbers, but `is`/`isNot` compare strings, sentinels, etc. */
  private cmpOp(
    op: string,
    l: Lifted<unknown>,
    r: Lifted<unknown>,
    v: boolean,
  ): Lifted<boolean> {
    return this.lift(
      v,
      this.binaryInfo?.(op, this.valued(l), this.valued(r)) ??
        this.baseInfo(v, [this.valued(l), this.valued(r)]),
    );
  }

  condition(id: number, _op: string, value: unknown): { result: unknown } {
    if (_op !== 'model') this.currentId = id;
    const raw = this.unwrap(value as Lifted<unknown>);
    this.conditionInfo?.(id, this.valued(value), Boolean(raw));
    return { result: raw };
  }

  $: SpecRuntime = {
    // StringOps
    length: (s) => {
      const v = (this.unwrap(s) as string).length;
      if (this.$.peek(this.$.isType(s, 'string'))) {
        return this.lift(
          v,
          this.lengthOfStringInfo?.(this.valued(s)) ??
            this.baseInfo(v, [this.valued(s)]),
        );
      }
      return this.lift(v, this.baseInfo(v, [this.valued(s)]));
    },
    substring: (s, from, to) => {
      const startN = this.unwrap(from) as number;
      const r = (this.unwrap(s) as string).substring(
        startN,
        this.unwrap(to) as number,
      );
      return this.lift(
        r,
        this.substringInfo?.(
          this.valued(s),
          this.valued(from),
          this.valued(to),
          r.length,
        ) ??
          this.baseInfo(r, [
            this.valued(s),
            this.valued(from),
            this.valued(to),
          ]),
      );
    },
    concatenate: (l, r) => {
      const r1 = this.unwrap(l);
      const r2 = this.unwrap(r);
      const res = r1 + r2;
      return this.lift(
        res,
        this.concatenateInfo?.(
          this.valued(l),
          r1.length,
          this.valued(r),
          r2.length,
        ) ?? this.baseInfo(res, [this.valued(l), this.valued(r)]),
      );
    },
    codeUnitAt: (s, i) => {
      const idx = this.unwrap(i) as number;
      const r = (this.unwrap(s) as string).charAt(idx);
      return this.lift(
        r,
        this.substringInfo?.(
          this.valued(s),
          this.valued(i),
          this.valued(i),
          r.length,
        ) ?? this.baseInfo(r, [this.valued(s), this.valued(i)]),
      );
    },
    trim: (s, leading, trailing) => {
      let r = this.unwrap(s) as string;
      if (leading && trailing) r = r.trim();
      else if (leading) r = r.trimStart();
      else if (trailing) r = r.trimEnd();
      // Result is a substring of `s`; propagate via baseInfo so taint/symbolic
      // provenance flows from the source string.
      return this.lift(r, this.baseInfo(r, [this.valued(s)]));
    },
    toLower: (s) => {
      const r = (this.unwrap(s) as string).toLowerCase();
      return this.lift(
        r,
        this.toLowerInfo?.(this.valued(s)) ??
          this.baseInfo(r, [this.valued(s)]),
      );
    },
    toUpper: (s) => {
      const r = (this.unwrap(s) as string).toUpperCase();
      return this.lift(
        r,
        this.toUpperInfo?.(this.valued(s)) ??
          this.baseInfo(r, [this.valued(s)]),
      );
    },

    // RegexOps
    regexExec: (regex, string) => {
      // Run `regex.exec(string)` concretely on the raw values (no wrapped
      // primitive leaks into the engine), then let the analysis supply the
      // symbolic match facts. The spec models assemble the observable result.
      const rawRegex = this.unwrap(regex as Lifted<RegExp>);
      const rawString = this.unwrap(string);
      // exec carrying capture spans, so the fallback can recover each capture as
      // a substring of the subject (see execWithIndices).
      const concrete = execWithIndices(rawRegex, rawString);
      const matched = concrete !== null;
      const info = this.regexExecInfo?.(
        this.valued(regex as Lifted<RegExp>) as Valued<Info, RegExp>,
        this.valued(string),
        concrete,
      );
      const elems = concrete === null ? [] : Array.from(concrete);
      return {
        // Whether it matched depends on the pattern AND the subject; the match
        // POSITION is structural (a number, not content) so it carries no taint
        // by default; concolic supplies the symbolic start via regexExecInfo.
        matched: this.lift(
          matched,
          info?.matched ??
            this.baseInfo(matched, [this.valued(regex), this.valued(string)]),
        ),
        index: this.lift(
          concrete === null ? -1 : concrete.index,
          info?.index ?? this.baseInfo(-1, []),
        ),
        captures: elems.map((c, i) => {
          const v = c ?? '';
          if (info?.captures?.[i] !== undefined)
            return this.lift(v, info.captures[i]);
          // No per-capture Info (e.g. taint): a capture's CONTENT is a substring
          // of the subject, so recover it through `$.substring` at its span —
          // offset-precise provenance flows (a tainted region of the subject
          // taints only the captures that overlap it).
          const span = concrete?.indices?.[i];
          if (span)
            return this.$.substring(
              string,
              this.$.base(span[0], []),
              this.$.base(span[1], []),
            );
          return this.lift(v, this.baseInfo(v, [this.valued(string)]));
        }),
        input: string,
      };
    },

    // ArithmeticOps
    add: (l, r) =>
      this.binOp(
        '+',
        l,
        r,
        (this.unwrap(l) as number) + (this.unwrap(r) as number),
      ),
    subtract: (l, r) =>
      this.binOp(
        '-',
        l,
        r,
        (this.unwrap(l) as number) - (this.unwrap(r) as number),
      ),
    multiply: (l, r) =>
      this.binOp(
        '*',
        l,
        r,
        (this.unwrap(l) as number) * (this.unwrap(r) as number),
      ),
    divide: (l, r) =>
      this.binOp(
        '/',
        l,
        r,
        (this.unwrap(l) as number) / (this.unwrap(r) as number),
      ),
    remainder: (l, r) =>
      this.binOp(
        '%',
        l,
        r,
        (this.unwrap(l) as number) % (this.unwrap(r) as number),
      ),
    negate: (x) => this.unOp('-', x, -(this.unwrap(x) as number)),
    exponentiate: (b, e) =>
      this.binOp(
        '**',
        b,
        e,
        (this.unwrap(b) as number) ** (this.unwrap(e) as number),
      ),
    bitwiseAND: (l, r) =>
      this.binOp(
        '&',
        l,
        r,
        (this.unwrap(l) as number) & (this.unwrap(r) as number),
      ),
    bitwiseOR: (l, r) =>
      this.binOp(
        '|',
        l,
        r,
        (this.unwrap(l) as number) | (this.unwrap(r) as number),
      ),
    bitwiseXOR: (l, r) =>
      this.binOp(
        '^',
        l,
        r,
        (this.unwrap(l) as number) ^ (this.unwrap(r) as number),
      ),

    // CompareOps
    lessThan: (l, r) =>
      this.cmpOp(
        '<',
        l,
        r,
        (this.unwrap(l) as number) < (this.unwrap(r) as number),
      ),
    lessThanEqual: (l, r) =>
      this.cmpOp(
        '<=',
        l,
        r,
        (this.unwrap(l) as number) <= (this.unwrap(r) as number),
      ),
    greaterThan: (l, r) =>
      this.cmpOp(
        '>',
        l,
        r,
        (this.unwrap(l) as number) > (this.unwrap(r) as number),
      ),
    greaterThanEqual: (l, r) =>
      this.cmpOp(
        '>=',
        l,
        r,
        (this.unwrap(l) as number) >= (this.unwrap(r) as number),
      ),
    condition: (bid, cond) =>
      this.condition(bid, 'model', cond).result as boolean,
    is: <L extends Lifted<unknown>, R extends Lifted<unknown>>(
      l: L,
      r: R,
    ): Lifted<boolean> =>
      this.cmpOp('===', l, r, this.unwrap(l) === this.unwrap(r)),
    isNot: <L extends Lifted<unknown>, R extends Lifted<unknown>>(
      l: L,
      r: R,
    ): Lifted<boolean> =>
      this.cmpOp('!==', l, r, this.unwrap(l) !== this.unwrap(r)),
    // isNaN/isFinite/isType go through baseInfo, not unaryInfo: unlike isInteger
    // (a genuine symbolic predicate over the SMT Real), these aren't modelable —
    // NaN/∞ aren't in the Real theory and a value's type is concrete. baseInfo
    // carries no op model, so for concolic the result is concretized and the
    // branch runs concretely (ExpoSE-faithful), while taint still flows
    // operand→result.
    isNaN: (x) => {
      const v = Number.isNaN(this.unwrap(x) as number);
      return this.lift(v, this.baseInfo(v, [this.valued(x)]));
    },
    isFinite: (x) => {
      const v = Number.isFinite(this.unwrap(x) as number);
      return this.lift(v, this.baseInfo(v, [this.valued(x)]));
    },
    isInteger: (x) => {
      const v = Number.isInteger(this.unwrap(x) as number);
      return this.lift(
        v,
        this.unaryInfo?.('isInteger', this.valued(x)) ??
          this.baseInfo(v, [this.valued(x)]),
      );
    },
    isType: (x, ty) => {
      const raw = this.unwrap(x);
      let v: boolean;
      switch (ty) {
        // "Type(x) is Object": objects and callables, but not null.
        case 'object':
          v = (typeof raw === 'object' && raw !== null) || typeof raw === 'function';
          break;
        case 'null':
          v = raw === null;
          break;
        case 'undefined':
          v = raw === undefined;
          break;
        // string / number / boolean / symbol / bigint / function
        default:
          v = typeof raw === ty;
      }
      return this.lift(v, this.baseInfo(v, [this.valued(x)]));
    },

    // MathOps
    min: (...xs) =>
      this.numOp(Math.min(...xs.map((x) => this.unwrap(x) as number)), xs),
    max: (...xs) =>
      this.numOp(Math.max(...xs.map((x) => this.unwrap(x) as number)), xs),
    abs: (x) => this.numOp(Math.abs(this.unwrap(x) as number), [x]),
    // floor/ceil/round route through unaryInfo (op-keyed, like $.isInteger) so an
    // analysis can model the rounding symbolically; without a hook they fall back
    // to baseInfo, same as numOp.
    floor: (x) => this.unOp('floor', x, Math.floor(this.unwrap(x) as number)),
    ceil: (x) => this.unOp('ceil', x, Math.ceil(this.unwrap(x) as number)),
    round: (x) => this.unOp('round', x, Math.round(this.unwrap(x) as number)),
    truncate: (x) => {
      const v = Math.trunc(this.unwrap(x) as number);
      return this.lift(
        v,
        this.truncateInfo?.(this.valued(x)) ??
          this.baseInfo(v, [this.valued(x)]),
      );
    },
    clamp: (x, lower, upper) => {
      const v = Math.max(
        this.unwrap(lower) as number,
        Math.min(this.unwrap(x) as number, this.unwrap(upper) as number),
      );
      return this.lift(
        v,
        this.clampInfo?.(
          this.valued(x),
          this.valued(lower),
          this.valued(upper),
        ) ??
          this.baseInfo(v, [
            this.valued(x),
            this.valued(lower),
            this.valued(upper),
          ]),
      );
    },

    // ListOps
    append: <T>(list: T[], x: T): T[] => {
      this.escaper.markEscapable(x);
      list.push(x);
      return list;
    },
    prepend: <T>(list: T[], x: T): T[] => {
      this.escaper.markEscapable(x);
      list.unshift(x);
      return list;
    },
    contains: <T>(list: T[], x: T): boolean => list.includes(x),
    range: (
      lo,
      loInclusive,
      hi,
      hiInclusive,
      ascending,
      bid,
    ): Lifted<number>[] => {
      // The interval is the SET {x : lo ≤/< x ≤/< hi}; `ascending` only picks the
      // order. Materialized eagerly as an array (driven by a native `for...of` in
      // generated code), so each index is a `lift`ed value: a user analysis observes
      // the loop through `rangeInfo` (which gets the possibly-symbolic bounds + bid),
      // and without that hook each index falls back to deriving from the bounds.
      const start = (this.unwrap(lo) as number) + (loInclusive ? 0 : 1);
      const end = (this.unwrap(hi) as number) - (hiInclusive ? 0 : 1);
      const out: Lifted<number>[] = [];
      for (let i = start; i <= end; i++) {
        out.push(
          this.lift(
            i,
            this.rangeInfo?.(
              i,
              this.valued(lo),
              loInclusive,
              this.valued(hi),
              hiInclusive,
              ascending,
              bid,
            ) ?? this.baseInfo(i, [this.valued(lo), this.valued(hi)]),
          ),
        );
      }
      if (!ascending) out.reverse();
      return out;
    },

    // SpecOps
    base: <T extends Unlifted<unknown> | Primitive>(
      v: T,
      parents: Lifted<unknown>[],
    ): Lifted<T> =>
      this.lift(
        v,
        this.baseInfo(
          v,
          parents.map((p) => this.valued(p)),
        ),
      ),
    peek: <T>(wrapped: Lifted<T>) => this.unwrap(wrapped),
    // A field read (`base[prop]`) from within a spec model, routed through the
    // same getFieldInfo the core `getField` hook uses for user-code `o[p]` — so a
    // model (e.g. AO__Get) observes a symbolic-array element / symbolic-object
    // field as a real Sym instead of a concretized `base`. The raw read mirrors
    // AO__Get's own (`peek(base)[peek(prop)]`).
    get: (base, prop) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: unknown = (this.$.peek(base) as any)[this.$.peek(prop) as any];
      return this.lift(
        result,
        this.getFieldInfo?.(
          this.valued(base),
          this.valued(prop),
          this.valued(result),
        ) ?? this.baseInfo(result, [this.valued(base), this.valued(prop)]),
      );
    },
    apply: (f, thisArg, args) => {
      const fn = this.unwrap(f as Lifted<Function>); // caller (AO__Call) ensured IsCallable
      // Route to the model when the callee is a known builtin — so a builtin
      // reached through a spec AO (a regex's @@match, an iterator protocol, …)
      // is modeled like a direct call, not run opaquely on wrapped args. Mirrors
      // invokeFun's modeled-call dispatch (incl. the builtin site).
      if (Model.support(fn)) {
        const modelFn = Model.ofBuiltin(fn);
        return this.withBuiltinSite(builtinName(fn), () =>
          modelFn(this.$, thisArg, ...args),
        ) as Lifted<unknown>;
      }
      // Non-modeled (e.g. an instrumented user callback): plain call, provenance
      // from callee/receiver/args — what AO__Call did before delegating here.
      return this.$.base(fn.call(thisArg, ...args), [f, thisArg, ...args]);
    },
    // Default for absent optional params (see SpecRuntime.undef / type.ts). `this`
    // here is the runtime object, so `this.base` is the op above. An absent arg
    // has no source, hence empty parents.
    get undef(): Lifted<undefined> {
      return this.base(undefined, []);
    },
    lit: <T extends Unlifted | Primitive>(v: T) => this.$.base(v, []),
  } satisfies SpecRuntime;

  literal(_id: number, value: unknown) {
    this.currentId = _id;
    this.escaper.markEscapableLiteral(value);
    const w = this.$.base(value as Unlifted<unknown>, []);
    return w === value ? undefined : { result: w };
  }

  /* for-in/of iterates natively, currently string iteration losts info */
  forInOfObject(_id: number, value: unknown, _isForIn: boolean) {
    const raw = this.$.peek(value as Lifted<unknown>);
    return raw === value ? undefined : { result: raw };
  }

  binaryPre(_id: number, op: string, left: Lifted, right: Lifted) {
    const l = this.$.peek(left);
    const r = this.$.peek(right);
    const frame: BinFrame = { ty: 'bin', op, left, right };
    return { op, left: l, right: r, skip: Model.supportSyntax(op), frame };
  }

  binary(
    _id: number,
    _op: string,
    _l: Lifted,
    _r: Lifted,
    result: Unlifted<unknown>,
    frame: unknown,
  ) {
    required(frame !== undefined, 'binary hook missing frame');
    // A binary op (including `+`/template via SYNTAX__add) attributes to the
    // user-code site, like NodeMedic stamps the source location on `binary`.
    this.currentId = _id;
    const f = frame as BinFrame;
    if (Model.supportSyntax(f.op)) {
      return {
        result: Model.ofSyntax(f.op)(
          this.$,
          f.left,
          f.right,
        ) as Lifted<unknown>,
      };
    } else {
      // assert : result is given
      // The hook's own l/r are the peeked raws binaryPre handed to native
      // execution — info lives only on the frame's wrapped operands.
      const left = this.valued(f.left);
      const right = this.valued(f.right);
      const resultInfo = NON_VALUE_BINARY_OPS.has(f.op)
        ? this.baseInfo(result, [left, right])
        : (this.binaryInfo?.(f.op, left, right) ??
          this.baseInfo(result, [left, right]));
      return { result: this.lift(result, resultInfo) };
    }
  }

  templateConcatPre(_id: number, left: Lifted, right: Lifted) {
    const l = this.$.peek(left);
    const r = this.$.peek(right);
    const frame: BinFrame = { ty: 'bin', op: '+', left, right };
    return { left: l, right: r, skip: true, frame };
  }

  templateConcat(
    _id: number,
    _left: Lifted,
    _right: Lifted,
    result: Unlifted<unknown>,
    frame: unknown,
  ) {
    required(frame !== undefined, 'templateConcat hook missing frame');
    this.currentId = _id;
    const f = frame as BinFrame;
    return {
      result: Model.ofSyntax('+')(this.$, f.left, f.right) as Lifted<string>,
    };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Lifted) {
    const e = this.$.peek(operand);
    const frame: UnFrame = { ty: 'un', op, operand: operand };
    return { op, operand: e, skip: false, frame };
  }

  unary(
    _id: number,
    _op: string,
    _prefix: boolean,
    _operand: unknown,
    result: Unlifted<unknown>,
    frame: unknown,
  ) {
    required(frame !== undefined, 'unary hook missing frame');
    this.currentId = _id;
    const f = frame as UnFrame;
    const transformed: Lifted<unknown> = this.lift(
      result,
      this.unaryInfo?.(f.op, this.valued(f.operand)) ??
        this.baseInfo(result, [this.valued(f.operand)]),
    );
    return { result: transformed };
  }

  getFieldPre(_id: number, base: any, prop: any) {
    const frame: GetFieldFrame = {
      ty: 'getField',
      base: base as Lifted,
      prop: prop as Lifted,
    };
    return {
      base: this.$.peek(base as Lifted),
      prop: this.$.peek(prop as Lifted),
      skip: false,
      frame,
    };
  }

  getField(_id: number, _base: any, _prop: any, result: any, frame: unknown) {
    required(frame !== undefined, 'getField hook missing frame');
    this.currentId = _id;
    const transformed = (() => {
      const f = frame as GetFieldFrame;
      const b: unknown = this.$.peek(f.base);
      const p: unknown = this.$.peek(f.prop);
      if (typeof b === 'string') {
        const i: number | undefined = this.$.peek(
          AO__CanonicalNumericIndexString(
            this.$,
            this.$.base((p as any).toString(), [f.prop]),
          ),
        );
        if (i !== undefined) {
          return this.$.substring(
            f.base as Lifted<string>,
            this.$.base(i, [f.prop]),
            this.$.base(i + 1, [f.prop]),
          );
        }
        if (p === 'length') {
          if (this.$.peek(this.$.isType(f.base, 'string'))) {
            return this.lift(
              result,
              this.lengthOfStringInfo?.(
                this.valued(f.base as Lifted<string>),
              ) ?? this.baseInfo(result, [this.valued(f.base)]),
            );
          } else {
            return this.lift(
              result,
              this.baseInfo(result, [this.valued(f.base)]),
            );
          }
        }
      }
      if (
        this.isWrapped(result) &&
        !this.domain.isBottom(this.getInfo(result))
      ) {
        return result as Lifted<unknown>;
      }
      return this.lift(
        result,
        this.getFieldInfo?.(
          this.valued(f.base),
          this.valued(f.prop),
          this.valued(result),
        ) ?? this.baseInfo(result, [this.valued(f.base), this.valued(f.prop)]),
      );
    })();
    return { result: transformed };
  }

  putFieldPre(_id: number, base: any, prop: any, value: any) {
    const rawBase: unknown = this.$.peek(base as Lifted);
    let v: unknown = value;
    if (ArrayBuffer.isView(rawBase)) {
      v = this.$.peek(value as Lifted);
    } else {
      this.escaper.markEscapable(value);
    }
    return {
      base: rawBase,
      prop: this.$.peek(prop as Lifted),
      value: v,
      skip: false,
    };
  }

  // Class field initializers store natively, like a putField.
  fieldInit(_id: number, _obj: any, _key: any, _isStatic: boolean, value: any) {
    this.escaper.markEscapable(value);
  }

  invokeFunPre(
    _id: number,
    _f: any,
    _base: any,
    args: any,
    _isConstructor: boolean,
    _isMethod: boolean,
  ) {
    this.currentId = _id;
    const argArr = Array.from(args) as Lifted[]; // can we do this without `as`?
    const entries: Lifted[] = _isMethod
      ? [_base as Lifted, ...argArr]
      : argArr;
    if (
      Model.support(_f) &&
      !entries.every(
        (e) =>
          this.isPrimitive(this.$.peek(e)) &&
          this.domain.isBottom(this.getInfo(e)),
      )
    ) {
      // model takes wrapped args and returns a wrapped result; runtime will dispatch via Model.of(f)
      return {
        skip: true,
        f: _f,
        base: _base,
        args: argArr,
        frame: { ty: 'opaque', f: _f, modeled: true, entries, escaped: [] },
      };
    }
    // fall through: A modeled builtin with all-bottom-primitive inputs

    // The callee reaches the engine's Function.prototype.apply site; a wrapped
    // primitive (a symbolic value used as a function) would leak its proxy there
    // ("called on #<Object>") instead of raising an ordinary "not a function"
    // TypeError. Peek it: a raw non-callable produces the natural error, while
    // instrumented/native function callees peek to themselves (no-op).
    const callee = this.$.peek(_f as Lifted);

    if (this.policy.isOpaque(_f)) {
      const esc = this.escaper.escape(_base, argArr, entries);
      if (esc.crossed.length > 0)
        this.escapedInfo?.(
          _f,
          esc.crossed.map((w) => this.valued(w)),
        );
      return {
        skip: false,
        f: callee,
        base: esc.base,
        args: esc.args,
        frame: {
          ty: 'opaque',
          f: _f,
          modeled: false,
          entries,
          escaped: esc.log,
        },
      };
    }
    return {
      skip: false,
      f: callee,
      base: _base,
      args,
      frame: { ty: 'transparent', entries },
    };
  }

  invokeFun(
    _id: number,
    _f: any,
    _base: any,
    _args: any,
    result: any,
    _isConstructor: boolean,
    _isMethod: boolean,
    frame: unknown,
  ) {
    required(frame !== undefined, 'invokeFun hook missing frame');
    this.currentId = _id;
    const f = frame as CallFrame;
    if (f.ty === 'opaque' && f.modeled) {
      const modelFn = Model.ofBuiltin(_f);
      result = this.withBuiltinSite(builtinName(_f), () =>
        modelFn(this.$, _base as Lifted, ...(_args as Lifted[])),
      );
    }

    const transformed = (() => {
      switch (f.ty) {
        case 'opaque': {
          // when modeled, the model dispatched above already returned a Wrapped value
          if (f.modeled) return result as unknown as Lifted<unknown>;
          if (f.escaped.length > 0) this.escaper.restore(f.escaped);
          const opaqueInfo = this.opaqueCallInfo?.(
            _f,
            Array.from(f.entries),
            result,
          );
          if (opaqueInfo !== undefined) return this.lift(result, opaqueInfo);
          if (
            this.isWrapped(result) &&
            !this.domain.isBottom(this.getInfo(result))
          ) {
            return result as Lifted<unknown>;
          }
          const parents = Array.from(f.entries) as Lifted[]; // can we do this without `as`?
          return this.$.base(result, parents);
        }
        case 'transparent': {
          if (
            this.isWrapped(result) &&
            !this.domain.isBottom(this.getInfo(result))
          ) {
            return result as Lifted<unknown>;
          }
          const parents = Array.from(f.entries) as Lifted[];
          return this.$.base(result, parents);
        }
      }
    })();

    return { result: transformed };
  }

  // wrappers
  private id = 0;
  private freshId() {
    return Symbol(this.id++);
  }

  private isObjectish(v: unknown): v is object | Function {
    return v !== null && (typeof v === 'object' || typeof v === 'function');
  }

  private isPrimitive(
    v: unknown,
  ): v is string | number | boolean | bigint | symbol | null | undefined {
    return !this.isObjectish(v);
  }

  private isWrapped(v: unknown): v is Lifted<unknown> {
    return this.isObjectish(v) && this.valueMap.has(v);
  }

  private isPrimitiveProxy(v: unknown): v is Lifted<unknown> {
    return this.isObjectish(v) && this.primitiveWrapper.has(v);
  }

  private wrap<T>(value: T): Lifted<T> {
    if (this.isObjectish(value)) {
      if (!this.valueMap.has(value as object)) {
        this.valueMap.set(value as object, { id: this.freshId(), value });
      }
      return value as Lifted<T>;
    }
    const proxy = {
      [util.inspect.custom]() {
        return '<wrapped-primitive>';
      },
    };
    this.primitiveWrapper.add(proxy);
    this.valueMap.set(proxy, { id: this.freshId(), value });
    return proxy as T as Lifted<T>;
  }

  private unwrap<T = unknown>(value: Lifted<T>): Unlifted<T> {
    if (!this.isObjectish(value)) return value as T as Unlifted<T>; // should not happen;
    const entry = this.valueMap.get(value);
    return entry === undefined
      ? (value as T as Unlifted<T>)
      : (entry.value as T as Unlifted<T>);
  }

  private forcedUnwrap(value: unknown): IdValuePair {
    return this.valueMap.get(this.wrap(value)) as IdValuePair; // should not fail
  }

  private getEntry(value: unknown): IdValuePair | undefined {
    if (!this.isObjectish(value)) return undefined;
    return this.valueMap.get(value);
  }
}
