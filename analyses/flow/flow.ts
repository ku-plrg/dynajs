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
import {
  AO__CanonicalNumericIndexString,
  AO__ToString,
  AO__ToNumber,
} from './spec/index.js';

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
  private liftedPrimitives = new WeakSet<object>();
  private valueMap = new WeakMap<object, IdValuePair>();
  private infoMap = new Map<symbol, Info>();

  private currentId: number | undefined = undefined;
  private currentBuiltin: string | undefined = undefined;

  private escaper = new BoundaryEscape(
    this.isPrimitiveProxy.bind(this),
    this.unlift.bind(this),
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

  protected abstract defaultInfo(value: unknown, parents: Valued<Info>[]): Info;

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
      value: this.unlift(v as Lifted<V>),
    } satisfies Valued<Info, V>;
  }

  /** NOTE never override this method */
  protected /* final */ lift<T>(
    value: T,
    info: Info = this.domain.getBottom(),
  ): Lifted<T> {
    let w: Lifted<T>;
    if (this.isObjectish(value)) {
      if (!this.valueMap.has(value as object)) {
        this.valueMap.set(value as object, { id: this.freshId(), value });
      }
      w = value as Lifted<T>;
    } else {
      const proxy = {
        [util.inspect.custom]() {
          return '<lifted-primitive>';
        },
      };
      this.liftedPrimitives.add(proxy);
      this.valueMap.set(proxy, { id: this.freshId(), value });
      w = proxy as T as Lifted<T>;
    }

    /* Bottom carries no information, so skip */
    if (!this.domain.isBottom(info)) this.setInfo(w, info);
    return w;
  }

  /** internal(flow.ts) */
  private numOp(v: number, parents: Lifted<unknown>[]): Lifted<number> {
    return this.lift(
      v,
      this.defaultInfo(
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
        this.defaultInfo(v, [this.valued(l), this.valued(r)]),
    );
  }

  /** internal(flow.ts) */
  private unOp(op: string, x: Lifted<number>, v: number): Lifted<number> {
    return this.lift(
      v,
      this.unaryInfo?.(op, this.valued(x)) ??
        this.defaultInfo(v, [this.valued(x)]),
    );
  }

  /** internal(flow.ts) — operands are Lifted<unknown>: ordering comparisons pass
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
        this.defaultInfo(v, [this.valued(l), this.valued(r)]),
    );
  }

  condition(id: number, _op: string, value: unknown): { result: unknown } {
    if (_op !== 'model') this.currentId = id;
    // is this correct...
    const cond = this.$.condition(
      id,
      value as Lifted<unknown> as Lifted<boolean>,
    );
    const raw = this.$.value(cond);
    return { result: raw };
  }

  $: SpecRuntime = {
    // StringOps
    length: (s) => {
      const v = (this.$.value(s) as string).length;
      if (this.$.value(this.$.isType(s, 'string'))) {
        return this.lift(
          v,
          this.lengthOfStringInfo?.(this.valued(s)) ??
            this.defaultInfo(v, [this.valued(s)]),
        );
      }
      return this.lift(v, this.defaultInfo(v, [this.valued(s)]));
    },
    substring: (s, from, to) => {
      const startN = this.unlift(from) as number;
      const r = (this.unlift(s) as string).substring(
        startN,
        this.unlift(to) as number,
      );
      return this.lift(
        r,
        this.substringInfo?.(
          this.valued(s),
          this.valued(from),
          this.valued(to),
          r.length,
        ) ??
          this.defaultInfo(r, [
            this.valued(s),
            this.valued(from),
            this.valued(to),
          ]),
      );
    },
    concatenate: (l, r) => {
      const r1 = this.unlift(l);
      const r2 = this.unlift(r);
      const res = r1 + r2;
      return this.lift(
        res,
        this.concatenateInfo?.(
          this.valued(l),
          r1.length,
          this.valued(r),
          r2.length,
        ) ?? this.defaultInfo(res, [this.valued(l), this.valued(r)]),
      );
    },
    codeUnitAt: (s, i) => {
      const idx = this.unlift(i) as number;
      const r = (this.unlift(s) as string).charAt(idx);
      return this.lift(
        r,
        this.substringInfo?.(
          this.valued(s),
          this.valued(i),
          this.valued(i),
          r.length,
        ) ?? this.defaultInfo(r, [this.valued(s), this.valued(i)]),
      );
    },
    trim: (s, leading, trailing) => {
      let r = this.unlift(s) as string;
      if (leading && trailing) r = r.trim();
      else if (leading) r = r.trimStart();
      else if (trailing) r = r.trimEnd();
      // Result is a substring of `s`; propagate via baseInfo so taint/symbolic
      // provenance flows from the source string.
      return this.lift(r, this.defaultInfo(r, [this.valued(s)]));
    },
    toLower: (s) => {
      const r = (this.unlift(s) as string).toLowerCase();
      return this.lift(
        r,
        this.toLowerInfo?.(this.valued(s)) ??
          this.defaultInfo(r, [this.valued(s)]),
      );
    },
    toUpper: (s) => {
      const r = (this.unlift(s) as string).toUpperCase();
      return this.lift(
        r,
        this.toUpperInfo?.(this.valued(s)) ??
          this.defaultInfo(r, [this.valued(s)]),
      );
    },

    // RegexOps
    regexExec: (regex, string) => {
      // Run `regex.exec(string)` concretely on the raw values (no lifted
      // primitive leaks into the engine), then let the analysis supply the
      // symbolic match facts. The spec models assemble the observable result.
      const rawRegex = this.unlift(regex as Lifted<RegExp>);
      const rawString = this.unlift(string);
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
            this.defaultInfo(matched, [
              this.valued(regex),
              this.valued(string),
            ]),
        ),
        index: this.lift(
          concrete === null ? -1 : concrete.index,
          info?.index ?? this.defaultInfo(-1, []),
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
              this.$.default(span[0], []),
              this.$.default(span[1], []),
            );
          return this.lift(v, this.defaultInfo(v, [this.valued(string)]));
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
        (this.unlift(l) as number) + (this.unlift(r) as number),
      ),
    subtract: (l, r) =>
      this.binOp(
        '-',
        l,
        r,
        (this.unlift(l) as number) - (this.unlift(r) as number),
      ),
    multiply: (l, r) =>
      this.binOp(
        '*',
        l,
        r,
        (this.unlift(l) as number) * (this.unlift(r) as number),
      ),
    divide: (l, r) =>
      this.binOp(
        '/',
        l,
        r,
        (this.unlift(l) as number) / (this.unlift(r) as number),
      ),
    remainder: (l, r) =>
      this.binOp(
        '%',
        l,
        r,
        (this.unlift(l) as number) % (this.unlift(r) as number),
      ),
    negate: (x) => this.unOp('-', x, -(this.unlift(x) as number)),
    exponentiate: (b, e) =>
      this.binOp(
        '**',
        b,
        e,
        (this.unlift(b) as number) ** (this.unlift(e) as number),
      ),
    bitwiseAND: (l, r) =>
      this.binOp(
        '&',
        l,
        r,
        (this.unlift(l) as number) & (this.unlift(r) as number),
      ),
    bitwiseOR: (l, r) =>
      this.binOp(
        '|',
        l,
        r,
        (this.unlift(l) as number) | (this.unlift(r) as number),
      ),
    bitwiseXOR: (l, r) =>
      this.binOp(
        '^',
        l,
        r,
        (this.unlift(l) as number) ^ (this.unlift(r) as number),
      ),

    // CompareOps
    lessThan: (l, r) =>
      this.cmpOp(
        '<',
        l,
        r,
        (this.unlift(l) as number) < (this.unlift(r) as number),
      ),
    lessThanEqual: (l, r) =>
      this.cmpOp(
        '<=',
        l,
        r,
        (this.unlift(l) as number) <= (this.unlift(r) as number),
      ),
    greaterThan: (l, r) =>
      this.cmpOp(
        '>',
        l,
        r,
        (this.unlift(l) as number) > (this.unlift(r) as number),
      ),
    greaterThanEqual: (l, r) =>
      this.cmpOp(
        '>=',
        l,
        r,
        (this.unlift(l) as number) >= (this.unlift(r) as number),
      ),
    condition: (bid, cond) => {
      const v = this.$.value(cond);
      const info =
        this.conditionInfo?.(bid, this.valued(cond), v) ??
        this.defaultInfo(v, [this.valued(cond)]);
      return this.lift(v, info);
    },
    is: <L extends Lifted<unknown>, R extends Lifted<unknown>>(
      l: L,
      r: R,
    ): Lifted<boolean> =>
      this.cmpOp('===', l, r, this.unlift(l) === this.unlift(r)),
    isNot: <L extends Lifted<unknown>, R extends Lifted<unknown>>(
      l: L,
      r: R,
    ): Lifted<boolean> =>
      this.cmpOp('!==', l, r, this.unlift(l) !== this.unlift(r)),
    // isNaN/isFinite/isType go through baseInfo, not unaryInfo: unlike isInteger
    // (a genuine symbolic predicate over the SMT Real), these aren't modelable —
    // NaN/∞ aren't in the Real theory and a value's type is concrete. baseInfo
    // carries no op model, so for concolic the result is concretized and the
    // branch runs concretely (ExpoSE-faithful), while taint still flows
    // operand→result.
    isNaN: (x) => {
      const v = Number.isNaN(this.unlift(x) as number);
      return this.lift(v, this.defaultInfo(v, [this.valued(x)]));
    },
    isFinite: (x) => {
      const v = Number.isFinite(this.unlift(x) as number);
      return this.lift(v, this.defaultInfo(v, [this.valued(x)]));
    },
    isInteger: (x) => {
      const v = Number.isInteger(this.unlift(x) as number);
      return this.lift(
        v,
        this.unaryInfo?.('isInteger', this.valued(x)) ??
          this.defaultInfo(v, [this.valued(x)]),
      );
    },
    isType: (x, ty) => {
      const raw = this.unlift(x);
      let v: boolean;
      switch (ty) {
        // "Type(x) is Object": objects and callables, but not null.
        case 'object':
          v =
            (typeof raw === 'object' && raw !== null) ||
            typeof raw === 'function';
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
      return this.lift(v, this.defaultInfo(v, [this.valued(x)]));
    },

    // MathOps
    min: (...xs) =>
      this.numOp(Math.min(...xs.map((x) => this.unlift(x) as number)), xs),
    max: (...xs) =>
      this.numOp(Math.max(...xs.map((x) => this.unlift(x) as number)), xs),
    abs: (x) => this.numOp(Math.abs(this.unlift(x) as number), [x]),
    // floor/ceil/round route through unaryInfo (op-keyed, like $.isInteger) so an
    // analysis can model the rounding symbolically; without a hook they fall back
    // to baseInfo, same as numOp.
    floor: (x) => this.unOp('floor', x, Math.floor(this.unlift(x) as number)),
    ceil: (x) => this.unOp('ceil', x, Math.ceil(this.unlift(x) as number)),
    round: (x) => this.unOp('round', x, Math.round(this.unlift(x) as number)),
    truncate: (x) => {
      const v = Math.trunc(this.unlift(x) as number);
      return this.lift(
        v,
        this.truncateInfo?.(this.valued(x)) ??
          this.defaultInfo(v, [this.valued(x)]),
      );
    },
    clamp: (x, lower, upper) => {
      const v = Math.max(
        this.unlift(lower) as number,
        Math.min(this.unlift(x) as number, this.unlift(upper) as number),
      );
      return this.lift(
        v,
        this.clampInfo?.(
          this.valued(x),
          this.valued(lower),
          this.valued(upper),
        ) ??
          this.defaultInfo(v, [
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
      const start = (this.unlift(lo) as number) + (loInclusive ? 0 : 1);
      const end = (this.unlift(hi) as number) - (hiInclusive ? 0 : 1);
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
            ) ?? this.defaultInfo(i, [this.valued(lo), this.valued(hi)]),
          ),
        );
      }
      if (!ascending) out.reverse();
      return out;
    },

    // SpecOps
    default: <T extends Unlifted<unknown> | Primitive>(
      v: T,
      parents: Lifted<unknown>[],
    ): Lifted<T> =>
      this.lift(
        v,
        this.defaultInfo(
          v,
          parents.map((p) => this.valued(p)),
        ),
      ),
    value: <T>(lifted: Lifted<T>): Unlifted<T> => this.unlift(lifted),
    info: <T>(lifted: Lifted<T>): unknown => this.getInfo(lifted),
    get: (base, prop) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: unknown = (this.$.value(base) as any)[
        this.$.value(prop) as any
      ];
      return this.lift(
        result,
        this.getFieldInfo?.(
          this.valued(base),
          this.valued(prop),
          this.valued(result),
        ) ?? this.defaultInfo(result, [this.valued(base), this.valued(prop)]),
      );
    },
    apply: (f, thisArg, args) => {
      const fn = this.unlift(f as Lifted<Function>); // caller (AO__Call) ensured IsCallable
      // Route to the model when the callee is a known builtin — so a builtin
      // reached through a spec AO (a regex's @@match, an iterator protocol, …)
      // is modeled like a direct call, not run opaquely on lifted args. Mirrors
      // invokeFun's modeled-call dispatch (incl. the builtin site).
      if (Model.support(fn)) {
        const modelFn = Model.ofBuiltin(fn);
        return this.withBuiltinSite(builtinName(fn), () =>
          modelFn(this.$, thisArg, ...args),
        ) as Lifted<unknown>;
      }
      // Non-modeled (e.g. an instrumented user callback): plain call, provenance
      // from callee/receiver/args — what AO__Call did before delegating here.
      return this.$.default(fn.call(thisArg, ...args), [f, thisArg, ...args]);
    },
  } satisfies SpecRuntime;

  literal(_id: number, value: unknown) {
    this.currentId = _id;
    this.escaper.markEscapableLiteral(value);
    const w = this.$.default(value as Unlifted<unknown>, []);
    return w === value ? undefined : { result: w };
  }

  /* for-in/of iterates natively, currently string iteration losts info */
  forInOfObject(_id: number, value: unknown, _isForIn: boolean) {
    const raw = this.$.value(value as Lifted<unknown>);
    return raw === value ? undefined : { result: raw };
  }

  binaryPre(_id: number, op: string, left: Lifted, right: Lifted) {
    const l = this.$.value(left);
    const r = this.$.value(right);
    const frame: BinFrame = { ty: 'bin', op, left, right };
    return { op, left: l, right: r, skip: op === '+', frame };
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
    if (f.op === '+') {
      return {
        result: this.SYNTAX__add(this.$, f.left, f.right) as Lifted<unknown>,
      };
    } else {
      // assert : result is given
      // The hook's own l/r are the peeked raws binaryPre handed to native
      // execution — info lives only on the frame's lifted operands.
      const left = this.valued(f.left);
      const right = this.valued(f.right);
      const resultInfo = NON_VALUE_BINARY_OPS.has(f.op)
        ? this.defaultInfo(result, [left, right])
        : (this.binaryInfo?.(f.op, left, right) ??
          this.defaultInfo(result, [left, right]));
      return { result: this.lift(result, resultInfo) };
    }
  }

  templateConcatPre(_id: number, left: Lifted, right: Lifted) {
    const l = this.$.value(left);
    const r = this.$.value(right);
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
      result: this.SYNTAX__add(this.$, f.left, f.right) as Lifted<string>,
    };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Lifted) {
    const e = this.$.value(operand);
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
        this.defaultInfo(result, [this.valued(f.operand)]),
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
      base: this.$.value(base as Lifted),
      prop: this.$.value(prop as Lifted),
      skip: false,
      frame,
    };
  }

  getField(_id: number, _base: any, _prop: any, result: any, frame: unknown) {
    required(frame !== undefined, 'getField hook missing frame');
    this.currentId = _id;
    const transformed = (() => {
      const f = frame as GetFieldFrame;
      const b: unknown = this.$.value(f.base);
      const p: unknown = this.$.value(f.prop);
      if (typeof b === 'string') {
        const i: number | undefined = this.$.value(
          AO__CanonicalNumericIndexString(
            this.$,
            this.$.default((p as any).toString(), [f.prop]),
          ),
        );
        if (i !== undefined) {
          return this.$.substring(
            f.base as Lifted<string>,
            this.$.default(i, [f.prop]),
            this.$.default(i + 1, [f.prop]),
          );
        }
        if (p === 'length') {
          if (this.$.value(this.$.isType(f.base, 'string'))) {
            return this.lift(
              result,
              this.lengthOfStringInfo?.(
                this.valued(f.base as Lifted<string>),
              ) ?? this.defaultInfo(result, [this.valued(f.base)]),
            );
          } else {
            return this.lift(
              result,
              this.defaultInfo(result, [this.valued(f.base)]),
            );
          }
        }
      }
      if (
        this.isLifted(result) &&
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
        ) ??
          this.defaultInfo(result, [this.valued(f.base), this.valued(f.prop)]),
      );
    })();
    return { result: transformed };
  }

  putFieldPre(_id: number, base: any, prop: any, value: any) {
    const rawBase: unknown = this.$.value(base as Lifted);
    let v: unknown = value;
    if (ArrayBuffer.isView(rawBase)) {
      v = this.$.value(value as Lifted);
    } else {
      this.escaper.markEscapable(value);
    }
    return {
      base: rawBase,
      prop: this.$.value(prop as Lifted),
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
    const entries: Lifted[] = _isMethod ? [_base as Lifted, ...argArr] : argArr;
    if (
      Model.support(_f) &&
      !entries.every(
        (e) =>
          this.isPrimitive(this.$.value(e)) &&
          this.domain.isBottom(this.getInfo(e)),
      )
    ) {
      // model takes lifted args and returns a lifted result; runtime will dispatch via Model.of(f)
      return {
        skip: true,
        f: _f,
        base: _base,
        args: argArr,
        frame: { ty: 'opaque', f: _f, modeled: true, entries, escaped: [] },
      };
    }
    // fall through: A modeled builtin with all-bottom-primitive inputs

    // The callee reaches the engine's Function.prototype.apply site; a lifted
    // primitive (a symbolic value used as a function) would leak its proxy there
    // ("called on #<Object>") instead of raising an ordinary "not a function"
    // TypeError. Peek it: a raw non-callable produces the natural error, while
    // instrumented/native function callees peek to themselves (no-op).
    const callee = this.$.value(_f as Lifted);

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
          // when modeled, the model dispatched above already returned a Lifted value
          if (f.modeled) return result as unknown as Lifted<unknown>;
          if (f.escaped.length > 0) this.escaper.restore(f.escaped);
          const opaqueInfo = this.opaqueCallInfo?.(
            _f,
            Array.from(f.entries),
            result,
          );
          if (opaqueInfo !== undefined) return this.lift(result, opaqueInfo);
          if (
            this.isLifted(result) &&
            !this.domain.isBottom(this.getInfo(result))
          ) {
            return result as Lifted<unknown>;
          }
          const parents = Array.from(f.entries) as Lifted[]; // can we do this without `as`?
          return this.$.default(result, parents);
        }
        case 'transparent': {
          if (
            this.isLifted(result) &&
            !this.domain.isBottom(this.getInfo(result))
          ) {
            return result as Lifted<unknown>;
          }
          const parents = Array.from(f.entries) as Lifted[];
          return this.$.default(result, parents);
        }
      }
    })();

    return { result: transformed };
  }

  ////////// syntax model ////////////
  private SYNTAX__add(
    $: SpecRuntime,
    lVal: Lifted<unknown>,
    rVal: Lifted<unknown>,
  ): Lifted<string> | Lifted<number> {
    if (
      $.value($.isType(lVal, 'object')) ||
      $.value($.isType(rVal, 'object'))
    ) {
      const l: Unlifted<unknown> = $.value(lVal);
      const r: Unlifted<unknown> = $.value(rVal);
      // @ts-expect-error - it calls the plus
      const v = l + r;
      // over-approximate the result type as unknown, since it could be either string or number
      return $.default(v, [lVal, rVal]);
    } else {
      const lPrim = lVal as Lifted<Primitive>;
      const rPrim = rVal as Lifted<Primitive>;
      //   c. If lPrim is a String or rPrim is a String, then
      if (
        $.value($.isType(lPrim, 'string')) ||
        $.value($.isType(rPrim, 'string'))
      ) {
        //     i. Let lStr be ? ToString(lPrim).
        const lStr = AO__ToString($, lPrim);
        //     ii. Let rStr be ? ToString(rPrim).
        const rStr = AO__ToString($, rPrim);
        //     iii. Return the string-concatenation of lStr and rStr.
        return $.concatenate(lStr, rStr);
      }
      //   d. Set lVal to lPrim.
      //   e. Set rVal to rPrim.
      // 2. NOTE: At this point, it must be a numeric operation.
      // 3. Let lNum be ? ToNumeric(lVal).
      const lNum = AO__ToNumber($, lPrim);
      // 4. Let rNum be ? ToNumeric(rVal).
      const rNum = AO__ToNumber($, rPrim);
      // 5. If SameType(lNum, rNum) is false, throw a TypeError exception.
      if (!(typeof $.value(lNum) === typeof $.value(rNum))) {
        throw new TypeError('TypeError: Cannot mix BigInt and other types');
      }
      // 6. If lNum is a BigInt, then
      //   a. Return ? BigInt::add(lNum, rNum). // ???
      // 7. Else,
      //   a. Assert: lNum is a Number.
      //   b. Let operation be Number::add.
      // 8. Return operation(lNum, rNum).
      return $.add(lNum, rNum);
    }
  }

  ////////// lift-hanlders //////////
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

  private isLifted(v: unknown): v is Lifted<unknown> {
    return this.isObjectish(v) && this.valueMap.has(v);
  }

  private isPrimitiveProxy(v: unknown): v is Lifted<unknown> {
    return this.isObjectish(v) && this.liftedPrimitives.has(v);
  }
  private unlift<T = unknown>(value: Lifted<T>): Unlifted<T> {
    if (!this.isObjectish(value)) return value as T as Unlifted<T>; // should not happen;
    const entry = this.valueMap.get(value);
    return entry === undefined
      ? (value as T as Unlifted<T>)
      : (entry.value as T as Unlifted<T>);
  }

  private getEntry(value: unknown): IdValuePair | undefined {
    if (!this.isObjectish(value)) return undefined;
    return this.valueMap.get(value);
  }
}
