import { ShadowTransfer } from './shadow.js';
import type {
  Lifted,
  Unlifted,
  Primitive,
  ValuedGeneral,
  Valued,
  LiftedTransferOps,
} from '../type.js';
import { CAPTURED, concatList } from '../utils.js';
import type * as escape from '../internal/escape.js';
import Model from '../internal/model.js';
import { SiteResolver } from '../internal/site.js';

const { ReflectApply } = CAPTURED;

export type CallPolicy = {
  isOpaque: (f: unknown) => boolean;
};

export abstract class LiftedTransfer<Shadow> extends ShadowTransfer<Shadow> {
  abstract policy: CallPolicy;

  protected siteResolver = new SiteResolver();

  /** Keep an already-informative lifted result; otherwise derive default info
   *  from the parents that flowed into the call. */
  protected carryOrDefault(
    result: unknown,
    parents: Lifted[],
  ): Lifted<unknown> {
    if (this.isLifted(result) && !this.domain.isBottom(this.getInfo(result)))
      return result as Lifted<unknown>;
    return this.$.default(result as Unlifted<unknown>, parents);
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
  protected callKind(
    f: unknown,
    entries: Lifted[],
  ): 'modeled' | 'opaque' | 'transparent' {
    if (
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
  protected callModeled(
    f: Function,
    base: Lifted,
    args: Lifted[],
  ): Lifted<unknown> {
    const modelFn = Model.ofBuiltin(f);
    return this.siteResolver.withBuiltinSite(
      this.siteResolver.builtinName(f),
      () =>
        ReflectApply(
          modelFn as Function,
          undefined,
          concatList([this.$, base], args),
        ),
    ) as Lifted<unknown>;
  }

  /** Provenance for a value returned from an uninstrumented (opaque) native
   *  call: restore the primitives escaped on the way in, then attach info from
   *  the analysis hook or fall back to default propagation. */
  protected opaqueResult(
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

  $: LiftedTransferOps = {
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
      const v = ReflectApply(
        Math.min,
        undefined,
        xs.map((x) => this.unlift(x) as number),
      ) as number;
      return this.lift(
        v,
        this.minInfo?.(xs.map((x) => this.valued(x))) ??
          this.defaultInfo(
            v,
            xs.map((x) => this.valued(x)),
          ),
      );
    },
    max: (...xs) => {
      const v = ReflectApply(
        Math.max,
        undefined,
        xs.map((x) => this.unlift(x) as number),
      ) as number;
      return this.lift(
        v,
        this.maxInfo?.(xs.map((x) => this.valued(x))) ??
          this.defaultInfo(
            v,
            xs.map((x) => this.valued(x)),
          ),
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
  } satisfies LiftedTransferOps;
}
