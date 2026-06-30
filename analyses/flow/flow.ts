import { isInstrumentedFn, required } from './utils.js';
import type { Analysis } from '../../src/types/analysis.js';
import type {
  SpecRuntime,
  Lifted,
  Unlifted,
  Primitive,
  Valued,
} from './type.js';
import Model from './internal/model.js';
import { isConstructable } from './internal/constructable.js';
import * as site from './internal/site.js';
import type * as escape from './internal/escape.js';
import { AO__CanonicalNumericIndexString, SYNTAX__add } from './spec/index.js';
import * as lift from './internal/lift.js';
import { CAPTURED, concatList } from './utils.js';

const { ReflectApply } = CAPTURED;

const NON_VALUE_BINARY_OPS = new Set(['instanceof', 'in']);

type BinFrame = {
  ty: 'bin';
  op: string;
  left: Lifted;
  right: Lifted;
  escaped?: escape.EscapeRecord[]; // coercion-method shadows for native (non-`+`) ops
};
type UnFrame = {
  ty: 'un';
  op: string;
  operand: Lifted;
  escaped?: escape.EscapeRecord[]; // coercion-method shadows for native +/-/~
};
type GetFieldFrame = { ty: 'getField'; base: Lifted; prop: Lifted };

type CallFrame = OpaqueCall | TransparentCall;
type OpaqueCall = {
  ty: 'opaque';
  f: unknown;
  modeled: boolean;
  entries: unknown[];
  escaped: escape.EscapeRecord[];
};
type TransparentCall = { ty: 'transparent'; entries: unknown[] };

export type CallPolicy = {
  isOpaque: (f: unknown) => boolean;
};

export abstract class FlowAnalysis<Info>
  extends lift.LiftedDomain<Info>
  implements Analysis
{
  protected siteResolver = new site.SiteResolver();
  protected site(): site.Site {
    return this.siteResolver.resolve();
  }

  protected transparentCalls: ReadonlySet<unknown> = new Set();

  /** Route supported builtin calls through the spec polyfill model. An analysis
   *  can set this false to run every builtin natively (the opaque path) — a
   *  baseline with no spec models. See analyses/noop-nobuiltin. */
  protected modelBuiltins = true;

  policy: CallPolicy = {
    isOpaque: (f) =>
      typeof f === 'function' &&
      !isInstrumentedFn(f) &&
      !this.transparentCalls.has(f),
  };

  ////////// transfer functions /////////

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
  protected containsStrInfo?(
    _s: Valued<Info, string>,
    _sub: Valued<Info, string>,
  ): Info;
  protected containsListInfo?(_list: Valued<Info>, _x: Valued<Info>): Info;
  protected trimInfo?(
    _src: Valued<Info, string>,
    _leading: boolean,
    _trailing: boolean,
  ): Info;

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
  protected minInfo?(_operands: Valued<Info, number>[]): Info;
  protected maxInfo?(_operands: Valued<Info, number>[]): Info;

  protected rangeInfo?(
    _indices: number[],
    _lo: Valued<Info, number>,
    _loInclusive: boolean,
    _hi: Valued<Info, number>,
    _hiInclusive: boolean,
    _ascending: boolean,
    _bid: number,
  ): Info[];

  /* property read from object property or array element */
  protected getFieldInfo?(
    _base: Valued<Info>,
    _prop: Valued<Info>,
    _result: Valued<Info>,
  ): Info;

  /* property write to object property or array element (`$.set`); side-effecting
   * (mutates the analysis's model of `base`), so it returns nothing. */
  protected setFieldInfo?(
    _base: Valued<Info>,
    _prop: Valued<Info>,
    _value: Valued<Info>,
  ): void;

  protected conditionInfo?(
    _id: number,
    _cond: Valued<Info>,
    _taken: boolean,
  ): void {}

  // opaqueCallInfo is enough for now
  // protected escapedInfo?(_f: unknown, _escaped: Valued<Info>[]): void {}

  /* opaque call the analysis wants to model */
  protected opaqueCallInfo?(
    _f: unknown,
    _entries: unknown[],
    _result: unknown,
  ): Info;

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
      // Result is a substring of `s`: an analysis can model the trim through
      // trimInfo, else baseInfo propagates provenance from the source string.
      return this.lift(
        r,
        this.trimInfo?.(this.valued(s), leading, trailing) ??
          this.defaultInfo(r, [this.valued(s)]),
      );
    },
    // Both operands unlifted — a lifted proxy reaching native
    // String.prototype.includes coerces to "[object Object]".
    containsStr: (s, sub) => {
      const v = (this.unlift(s) as string).includes(this.unlift(sub) as string);
      return this.lift(
        v,
        this.containsStrInfo?.(this.valued(s), this.valued(sub)) ??
          this.defaultInfo(v, [this.valued(s), this.valued(sub)]),
      );
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
    min: (...xs) => {
      const v = ReflectApply(Math.min, undefined, xs.map((x) => this.unlift(x) as number)) as number;
      return this.lift(
        v,
        this.minInfo?.(xs.map((x) => this.valued(x))) ??
          this.defaultInfo(v, xs.map((x) => this.valued(x))),
      );
    },
    max: (...xs) => {
      const v = ReflectApply(Math.max, undefined, xs.map((x) => this.unlift(x) as number)) as number;
      return this.lift(
        v,
        this.maxInfo?.(xs.map((x) => this.valued(x))) ??
          this.defaultInfo(v, xs.map((x) => this.valued(x))),
      );
    },
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
    contains: <T>(seq: T[] | Lifted<string>, x: T): Lifted<boolean> =>
      // Overloaded in the spec metalanguage (see DynamicOps.contains): a List
      // is a native array, a String a lifted proxy. Recover the domain here.
      Array.isArray(seq)
        ? this.$.containsList(seq, x)
        : this.$.containsStr(seq, x as Lifted<string>),
    containsList: <T>(list: T[], x: T): Lifted<boolean> => {
      const v = list.includes(x);
      return this.lift(
        v,
        this.containsListInfo?.(this.valued(list), this.valued(x)) ??
          this.defaultInfo(v, [this.valued(list), this.valued(x)]),
      );
    },
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
      // generated code). The whole index list goes to `rangeInfo` once — so the
      // analysis sees the bounds (and can record the trip-count guard via `bid`) and
      // returns one Info per index; without the hook each index derives from the bounds.
      const start = (this.unlift(lo) as number) + (loInclusive ? 0 : 1);
      const end = (this.unlift(hi) as number) - (hiInclusive ? 0 : 1);
      const indices: number[] = [];
      for (let i = start; i <= end; i++) indices.push(i);
      const infos = this.rangeInfo?.(
        indices,
        this.valued(lo),
        loInclusive,
        this.valued(hi),
        hiInclusive,
        ascending,
        bid,
      );
      const out = indices.map((i, k) =>
        this.lift(
          i,
          infos?.[k] ?? this.defaultInfo(i, [this.valued(lo), this.valued(hi)]),
        ),
      );
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
    set: (base, prop, value) => {
      const b = this.$.value(base);
      const p: unknown = this.$.value(prop);

      const storeRaw = ArrayBuffer.isView(b) || p === 'length';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (b as any)[p as any] = storeRaw ? this.$.value(value) : value;
      this.setFieldInfo?.(
        this.valued(base),
        this.valued(prop),
        this.valued(value),
      );
      return value;
    },
    apply: (f, thisArg, args) => {
      // A function reached through a spec AO (AO__Call → a regex's @@replace, an
      // iterator's next, a user callback, …). Same dispatch as a call from
      // instrumented code, but made here in one shot since no engine hook
      // straddles it. See callKind/callModeled/opaqueResult.
      const fn = this.unlift(f as Lifted<Function>); // AO__Call ensured IsCallable
      const argArr = args as Lifted[];
      const entries = concatList([thisArg], argArr) as Lifted[];
      const kind = this.callKind(fn, entries);
      if (kind === 'modeled') return this.callModeled(fn, thisArg, argArr);
      if (kind === 'opaque') {
        // Crosses into uninstrumented native code: strip lifted primitives out
        // of the receiver/args first — otherwise a lifted-primitive proxy hits
        // a native protocol site it can't satisfy (ToBoolean reads truthy,
        // iteration throws, typeof is "object"; ToNumber/ToString now read
        // through via Symbol.toPrimitive, see lift.ts), then restore. escape()
        // also shadows the operands' coercion methods (valueOf/toString/
        // @@toPrimitive) so a native ToPrimitive that calls them gets a raw
        // return — see the note in invokeFunPre's opaque branch.
        const esc = this.escaper.escape(thisArg, argArr, entries);
        // if (esc.crossed.length > 0)
        //   this.escapedInfo?.(
        //     fn,
        //     esc.crossed.map((w) => this.valued(w)),
        //   );
        const result = ReflectApply(fn as Function, esc.base, esc.args);
        return this.opaqueResult(fn, entries, result, esc.log);
      }
      // transparent: instrumented callback — lifted values flow straight through
      // so the callee propagates info internally.
      return this.carryOrDefault(
        ReflectApply(fn as Function, thisArg, argArr),
        entries,
      );
    },
  } satisfies SpecRuntime;

  condition(id: number, _op: string, value: unknown): { result: unknown } {
  if (_op !== 'model') this.siteResolver.reportId(id);
  // is this correct...
  const cond = this.$.condition(
    id,
    value as Lifted<unknown> as Lifted<boolean>,
  );
  const raw = this.$.value(cond);
  return { result: raw };
}

  classHeritage(_id: number, value: unknown): { result: unknown } {
    return { result: this.$.value(value as Lifted<unknown>) };
  }

  literal(_id: number, value: unknown) {
    this.siteResolver.reportId(_id);
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
    // `+` is authoritative (skip + SYNTAX__add, which ToPrimitives soundly).
    // Other ops run natively on the peeked raws, so an object operand would have
    // its instrumented valueOf/toString re-entered by native coercion — shadow
    // those with unlifting wrappers first, restored in `binary`.
    const escaped =
      op === '+' ? undefined : this.escaper.wrapForOperator([l, r]);
    const frame: BinFrame = { ty: 'bin', op, left, right, escaped };
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
    this.siteResolver.reportId(_id);
    const f = frame as BinFrame;
    if (f.escaped) this.escaper.restore(f.escaped); // unwrap operand coercion shadows
    if (f.op === '+') {
      return {
        result: SYNTAX__add(this.$, f.left, f.right) as Lifted<unknown>,
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
    this.siteResolver.reportId(_id);
    const f = frame as BinFrame;
    return {
      result: SYNTAX__add(this.$, f.left, f.right) as Lifted<string>,
    };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Lifted) {
    const e = this.$.value(operand);
    // +/-/~ coerce their operand natively (ToNumber/ToNumeric); shadow an object
    // operand's instrumented coercion methods first, restored in `unary`. Other
    // unary ops (!, typeof, void, delete) don't ToPrimitive an object.
    const escaped =
      op === '+' || op === '-' || op === '~'
        ? this.escaper.wrapForOperator([e])
        : undefined;
    const frame: UnFrame = { ty: 'un', op, operand, escaped };
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
    this.siteResolver.reportId(_id);
    const f = frame as UnFrame;
    if (f.escaped) this.escaper.restore(f.escaped); // unwrap operand coercion shadows
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

  getField(
    _id: number,
    _base: any,
    _prop: any,
    result: any,
    _isPrivate: boolean,
    frame: unknown,
  ) {
    required(frame !== undefined, 'getField hook missing frame');
    this.siteResolver.reportId(_id);
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
          // A numeric index already carries `i` as its value, so pass it through
          // to keep any (possibly symbolic) index info — e.g. `r[r.length - 1]`
          // stays tied to the subject's symbolic length instead of collapsing to
          // the seed's concrete offset. A string key ("3") has no such info, so
          // route it through the canonical index `i`.
          const start =
            typeof p === 'number'
              ? (f.prop as Lifted<number>)
              : this.$.default(i, [f.prop]);
          return this.$.substring(
            f.base as Lifted<string>,
            start,
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

  // // Class field initializers store natively, like a putField.
  // fieldInit(_id: number, _obj: any, _key: any, _isStatic: boolean, value: any) {
  //   this.escaper.markEscapable(value);
  // }

  // the native instrumenter needs a raw string
  instrumentCodePre(_id: number, code: any, _isDirect: boolean) {
    return { code: this.$.value(code as Lifted), skip: false };
  }

  // ---- shared call dispatch (used by invokeFunPre/invokeFun and $.apply) ----
  // A call from instrumented code is split across invokeFunPre (decide + escape
  // args) and invokeFun (run the model / shape the result) because the engine
  // makes the native call between the two hooks. $.apply makes the call itself,
  // so it runs the same pieces back-to-back. The classification and the
  // result-shaping live here so neither path can drift from the other.

  /** modeled  — a supported builtin with at least one non-bottom or non-primitive
   *             input (all-bottom-primitive inputs skip the model for speed);
   *  opaque   — crosses into uninstrumented native code (escape args, run, restore);
   *  transparent — an instrumented callee; lifted values flow straight through. */
  private callKind(
    f: unknown,
    entries: Lifted[],
  ): 'modeled' | 'opaque' | 'transparent' {
    if (
      this.modelBuiltins &&
      Model.support(f as Function) &&
      !entries.every(
        (e) =>
          this.isPrimitive(this.$.value(e)) &&
          this.domain.isBottom(this.getInfo(e)),
      )
    )
      return 'modeled';
    return this.policy.isOpaque(f) ? 'opaque' : 'transparent';
  }

  /** Run a modeled builtin's polyfill under the builtin's Site. */
  private callModeled(
    f: Function,
    base: Lifted,
    args: Lifted[],
  ): Lifted<unknown> {
    const modelFn = Model.ofBuiltin(f);
    return this.siteResolver.withBuiltinSite(
      this.siteResolver.builtinName(f),
      () => ReflectApply(modelFn as Function, undefined, concatList([this.$, base], args)),
    ) as Lifted<unknown>;
  }

  /** Keep an already-informative lifted result; otherwise derive default info
   *  from the parents that flowed into the call. */
  private carryOrDefault(result: unknown, parents: Lifted[]): Lifted<unknown> {
    if (this.isLifted(result) && !this.domain.isBottom(this.getInfo(result)))
      return result as Lifted<unknown>;
    return this.$.default(result as Unlifted<unknown>, parents);
  }

  /** Provenance for a value returned from an uninstrumented (opaque) native
   *  call: restore the primitives escaped on the way in, then attach info from
   *  the analysis hook or fall back to default propagation. */
  private opaqueResult(
    f: unknown,
    entries: Lifted[],
    result: unknown,
    escaped: escape.EscapeRecord[],
  ): Lifted<unknown> {
    if (escaped.length > 0) this.escaper.restore(escaped);
    const opaqueInfo = this.opaqueCallInfo?.(f, entries, result);
    if (opaqueInfo !== undefined) return this.lift(result, opaqueInfo);
    return this.carryOrDefault(result, entries);
  }

  invokeFunPre(
    _id: number,
    _f: any,
    _base: any,
    args: any,
    _isConstructor: boolean,
    _isMethod: boolean,
  ) {
    this.siteResolver.reportId(_id);
    const argArr = Array.from(args) as Lifted[]; // can we do this without `as`?
    const entries: Lifted[] = _isMethod
      ? (concatList([_base], argArr) as Lifted[])
      : argArr;
    const kind = this.callKind(_f, entries);
    if (kind === 'modeled') {
      // A modeled builtin has no [[Construct]] unless esmeta stamped CONSTRUCTABLE
      // on its polyfill, so `new <method>()` throws like the native would. Without
      // this the model runs and returns a value, silently passing not-a-constructor.
      if (_isConstructor && !isConstructable(Model.ofBuiltin(_f))) {
        throw new TypeError(
          `${this.siteResolver.builtinName(_f)} is not a constructor`,
        );
      }
      // model takes lifted args and returns a lifted result; the engine skips
      // the native call (skip:true) and invokeFun runs the model.
      return {
        skip: true,
        f: _f,
        base: _base,
        args: argArr,
        frame: { ty: 'opaque', f: _f, modeled: true, entries, escaped: [] },
      };
    }

    // The callee reaches the engine's Function.prototype.apply site; a lifted
    // primitive (a symbolic value used as a function) would leak its proxy there
    // ("called on #<Object>") instead of raising an ordinary "not a function"
    // TypeError. Peek it: a raw non-callable produces the natural error, while
    // instrumented/native function callees peek to themselves (no-op).
    const callee = this.$.value(_f as Lifted);

    if (kind === 'opaque') {
      // RETURN-SIDE SEAM. A *blanket* unlift of every instrumented-function
      // arg/receiver's return is unsound and stays unhandled:
      //  - The boundary can't tell whether native will COERCE the return (wants
      //    raw) or STORE it as data and hand it back to instrumented code (wants
      //    lifted). A blanket unlift breaks the store path — e.g. unmodeled
      //    Array.prototype.flatMap would lose per-element info.
      //  - Unlike escape (which strips THEN restores into a container we own), a
      //    return lands in native's container: no restore point, so the unlift
      //    is permanent loss.
      //  - For native ToBoolean (e.g. unmodeled `every`) unlifting is anyway
      //    pointless (a raw bool carries no info; any object is truthy) — closed
      //    by MODELING the builtin, i.e. a wrapper scoped to a known callee.
      // The ONE return-side case that IS sound to wrap is coercion: native
      // OrdinaryToPrimitive calls the operand's valueOf/toString/@@toPrimitive
      // and REJECTS an object return ("Cannot convert object to primitive
      // value") — a lifted-primitive proxy is an object. Those three methods are
      // always coerced (never stored) and live on an operand we own, so escape()
      // shadows them with unlifting wrappers and restores after — see
      // BoundaryEscape.wrapCoercion.
      const esc = this.escaper.escape(_base, argArr, entries);
      // if (esc.crossed.length > 0)
      //   this.escapedInfo?.(
      //     _f,
      //     esc.crossed.map((w) => this.valued(w)),
      //   );
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
    this.siteResolver.reportId(_id);
    const f = frame as CallFrame;
    if (f.ty === 'transparent')
      return { result: this.carryOrDefault(result, f.entries as Lifted[]) };
    // opaque: either the model runs now (the engine skipped the native call) or
    // we shape the value the native call returned.
    if (f.modeled)
      return {
        result: this.callModeled(_f, _base as Lifted, _args as Lifted[]),
      };
    return {
      result: this.opaqueResult(_f, f.entries as Lifted[], result, f.escaped),
    };
  }
}
