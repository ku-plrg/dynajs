import util from "node:util";
import { required } from "@/utils.js";
import type { Analysis } from "@/types/analysis.js";
import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "./type.js";
import { Model } from "./model.js";

type ValuedGeneral<Shape extends {}, Value = unknown> = Shape & { value: Value };

type IdValuePair = ValuedGeneral<{ id: symbol}, unknown>;

type BinFrame = { ty: 'bin'; op: string; left: Wrapped; right: Wrapped };
type UnFrame  = { ty: 'un'; op: string; operand: Wrapped };
type GetFieldFrame = { ty: 'getField'; base: Wrapped; prop: Wrapped };

type CallFrame = OpaqueCall | TransparentCall;
type OpaqueCall = { ty: 'opaque'; f: unknown; modeled: boolean; entries: unknown[] };
type TransparentCall = { ty: 'transparent', entries: unknown[] };

// The user-facing view of a value: its concrete `value` plus the analysis `info`
// attached to it (`info` is undefined when nothing has been attached yet). This
// is the only currency the Info hooks speak — the framework projects each
// internal `Wrapped` into a `Valued` before calling a hook, so a user analysis
// never has to touch `Wrapped`/`Unwrapped`.
// export type Valued<Info, Value = unknown> = { info: Info | undefined; value: Value };
export type Valued<Info, Value = unknown> = ValuedGeneral<{ 'info': Info | undefined }, Value>;

export type InfoDomain<Info> = {
  getBottom: () => Info;
  isBottom: (info: Info) => boolean;
}

// How the analysis treats call boundaries: a function for which `isOpaque`
// returns true is a black box — the framework doesn't trace inside it and
// propagates info to its result via baseInfo over the (unwrapped) args.
// ("call policy", to keep clear of taint's source/sink "taint policy".)
export type CallPolicy = {
  isOpaque: (f: unknown) => boolean;
}

// Returns the canonical char-access index when `p` is a property key that JS would
// resolve to `s[i]` (i.e. a non-negative integer in range whose string form matches).
function asStringIndex(p: unknown, len: number): number | undefined {
  let n: number;
  if (typeof p === 'number') n = p;
  else if (typeof p === 'string') {
    n = Number(p);
    if (String(n) !== p) return undefined;
  } else return undefined;
  if (!Number.isInteger(n) || n < 0 || n >= len) return undefined;
  return n;
}

export abstract class FlowAnalysis<Info> implements Analysis {

  private primitiveWrapper = new WeakSet<object>();
  private valueMap = new WeakMap<object, IdValuePair>();
  private infoMap = new Map<symbol, Info>();

  abstract domain: InfoDomain<Info>;
  abstract policy: CallPolicy;

  // ---- Info hooks ----
  //
  // `baseInfo` is the ONE primitive every analysis must define: the flow-through
  // info for a result, derived from its operands' info (taint = OR of taint bits;
  // concolic = none — it builds structure via the hooks below instead).
  //
  // Every other hook is an OPTIONAL precision refinement. Each caller tries the
  // specific hook, then falls back to `baseInfo` flow-through (`hook(...) ??
  // baseInfo(result, parents)`). So an analysis that overrides nothing still gets
  // sound propagation through every op — overriding a hook only buys
  // precision/structure (taint's char-level substring/concat ranges, concolic's
  // operator/substr Sym nodes). Recall is preserved by the fallback; precision is
  // opt-in.
  //
  // Every operand a hook receives is a `Valued` (its concrete value + attached
  // info) — never a `Wrapped`. `baseInfo` is the exception: its `value` is the
  // freshly-produced result (no info yet), and its `parents` are the operands.
  protected abstract baseInfo(value: unknown, parents: Valued<Info>[]): Info;

  // String structure.
  protected substringInfo?(_src: Valued<Info, string>, _start: number, _resultLength: number): Info
  protected concatenateInfo?(_left: Valued<Info, string>, _leftLength: number, _right: Valued<Info, string>, _rightLength: number): Info
  protected lengthOfStringInfo?(_src: Valued<Info, string>): Info

  // Arithmetic (`+ - * / …`) and ordering comparisons (`< <= > >=`).
  protected binaryInfo?(_op: string, _left: Valued<Info>, _right: Valued<Info>): Info
  protected unaryInfo?(_op: string, _operand: Valued<Info>): Info
  // ToIntegerOrInfinity's truncate-toward-zero, so a symbolic numeric operand
  // keeps its Sym across the integer coercion (e.g. a symbolic index).
  protected truncateInfo?(_src: Valued<Info, number>): Info

  // A branch was taken on `cond` (concrete direction `taken`), keyed by the
  // branch's source `id`. Unlike the hooks above this produces no new value — it
  // records a fact (a path constraint), so it returns void. Path-tracking
  // analyses (concolic) override it; everyone else ignores branches.
  protected conditionInfo?(_id: number, _cond: Valued<Info>, _taken: boolean): void {}

  // ---- Info storage helpers ----

  protected /* final */ getInfo(value: unknown): Info {
    const e = this.getEntry(value);
    return e === undefined ? this.domain.getBottom() : this.infoMap.get(e.id) ?? this.domain.getBottom();
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
    return { info: this.getInfo(v) satisfies Info, value: this.unwrap(v as Wrapped<V>) } satisfies Valued<Info, V>;
  }

  private lift<T>(value: T, info: Info): Wrapped<T> {
    const w = this.wrap(value);
    // Bottom carries no information, so skip the map entry — getInfo's miss
    // path reconstructs it. (infoMap is a strong Map; storing bottoms would
    // grow it with every wrapped value.)
    if (!this.domain.isBottom(info)) this.setInfo(w, info);
    return w;
  }

  /** internal(flow.ts) */
  private numOp(v: number, parents: Wrapped<unknown>[]): Wrapped<number> {
    return this.lift(v, this.baseInfo(v, parents.map((p) => this.valued(p))));
  }

  /** internal(flow.ts) */
  private binOp(op: string, l: Wrapped<number>, r: Wrapped<number>, v: number): Wrapped<number> {
    return this.lift(v, this.binaryInfo?.(op, this.valued(l), this.valued(r)) ?? this.baseInfo(v, [this.valued(l), this.valued(r)]))
  }

  /** internal(flow.ts) */
  private unOp(op: string, x: Wrapped<number>, v: number): Wrapped<number> {
    return this.lift(v, this.unaryInfo?.(op, this.valued(x)) ?? this.baseInfo(v, [this.valued(x)]));
  }

  /** internal(flow.ts) */
  private cmpOp(op: string, l: Wrapped<number>, r: Wrapped<number>, v: boolean): Wrapped<boolean> {
    return this.lift(v, this.binaryInfo?.(op, this.valued(l), this.valued(r)) ?? this.baseInfo(v, [this.valued(l), this.valued(r)]));
  }

  // A branch point. Unwrap so native control flow sees the raw boolean, and hand
  // the condition to the `conditionInfo` hook so a path-tracking analysis can
  // record it. This is the same hook the instrumenter dispatches to for
  // `D$.C(id, op, value)` on user code AND the one model-internal branches funnel
  // through (SpecRuntime.condition), so both go through one place.
  condition(id: number, _op: string, value: unknown): { result: unknown } {
    const raw = this.unwrap(value as Wrapped<unknown>);
    this.conditionInfo?.(id, this.valued(value), Boolean(raw));
    return { result: raw };
  }

  $: SpecRuntime = {
    length: (s) => {
      const v = (this.unwrap(s) as string).length;
      if (this.$.isType(s, 'string')) {
        return this.lift(v, this.lengthOfStringInfo?.(this.valued(s)) ?? this.baseInfo(v, [this.valued(s)]));
      }
      return this.lift(v, this.baseInfo(v, [this.valued(s)]));
    },
    substring: (s, from, to) => {
      const startN = this.unwrap(from) as number;
      const r = (this.unwrap(s) as string).substring(startN, this.unwrap(to) as number);
      return this.lift(r, this.substringInfo?.(this.valued(s), startN, r.length) ?? this.baseInfo(r, [this.valued(s)]));
    },
    concatenate: (l, r) => {
      const r1 = this.unwrap(l);
      const r2 = this.unwrap(r);
      const res = r1 + r2;
      return this.lift(res, this.concatenateInfo?.(this.valued(l), r1.length, this.valued(r), r2.length) ?? this.baseInfo(res, [this.valued(l), this.valued(r)]));
    },
    codeUnitAt: (s, i) => {
      const idx = this.unwrap(i) as number;
      const r = (this.unwrap(s) as string).charAt(idx);
      return this.lift(r, this.substringInfo?.(this.valued(s), idx, r.length) ?? this.baseInfo(r, [this.valued(s)]));
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

    add: (l, r) => this.binOp('+', l, r, (this.unwrap(l) as number) + (this.unwrap(r) as number)),
    subtract: (l, r) => this.binOp('-', l, r, (this.unwrap(l) as number) - (this.unwrap(r) as number)),
    multiply: (l, r) => this.binOp('*', l, r, (this.unwrap(l) as number) * (this.unwrap(r) as number)),
    divide: (l, r) => this.binOp('/', l, r, (this.unwrap(l) as number) / (this.unwrap(r) as number)),
    remainder: (l, r) => this.binOp('%', l, r, (this.unwrap(l) as number) % (this.unwrap(r) as number)),
    negate: (x) => this.unOp('-', x, -(this.unwrap(x) as number)),
    exponentiate: (b, e) => this.binOp('**', b, e, (this.unwrap(b) as number) ** (this.unwrap(e) as number)),
    bitwiseAND: (l, r) => this.binOp('&', l, r, (this.unwrap(l) as number) & (this.unwrap(r) as number)),
    bitwiseOR: (l, r) => this.binOp('|', l, r, (this.unwrap(l) as number) | (this.unwrap(r) as number)),
    bitwiseXOR: (l, r) => this.binOp('^', l, r, (this.unwrap(l) as number) ^ (this.unwrap(r) as number)),

    lessThan: (l, r) => this.cmpOp('<', l, r, (this.unwrap(l) as number) < (this.unwrap(r) as number)),
    lessThanEqual: (l, r) => this.cmpOp('<=', l, r, (this.unwrap(l) as number) <= (this.unwrap(r) as number)),
    greaterThan: (l, r) => this.cmpOp('>', l, r, (this.unwrap(l) as number) > (this.unwrap(r) as number)),
    greaterThanEqual: (l, r) => this.cmpOp('>=', l, r, (this.unwrap(l) as number) >= (this.unwrap(r) as number)),
    condition: (bid, cond) => this.condition(bid, 'model', cond).result as boolean,
    is: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R): l is Extract<L, R> =>
      this.unwrap(l) === this.unwrap(r),
    isNot: <L extends Wrapped<unknown>, R extends Wrapped<unknown>>(l: L, r: R): l is Exclude<L, R> =>
      this.unwrap(l) !== this.unwrap(r),
    isNaN: (x) => Number.isNaN(this.unwrap(x) as number),
    isFinite: (x) => Number.isFinite(this.unwrap(x) as number),
    isType: (x, ty) => {
      const v = this.unwrap(x);
      switch (ty) {
        // "Type(x) is Object": objects and callables, but not null.
        case 'object': return (typeof v === 'object' && v !== null) || typeof v === 'function';
        case 'null': return v === null;
        case 'undefined': return v === undefined;
        // string / number / boolean / symbol / bigint / function
        default: return typeof v === ty;
      }
    },

    min: (...xs) => this.numOp(Math.min(...xs.map((x) => this.unwrap(x) as number)), xs),
    max: (...xs) => this.numOp(Math.max(...xs.map((x) => this.unwrap(x) as number)), xs),
    abs: (x) => this.numOp(Math.abs(this.unwrap(x) as number), [x]),
    floor: (x) => this.numOp(Math.floor(this.unwrap(x) as number), [x]),
    truncate: (x) => {
      const v = Math.trunc(this.unwrap(x) as number);
      return this.lift(v, this.truncateInfo?.(this.valued(x)) ?? this.baseInfo(v, [this.valued(x)]));
    },
    clamp: (x, lower, upper) =>
      this.numOp(
        Math.max(this.unwrap(lower) as number, Math.min(this.unwrap(x) as number, this.unwrap(upper) as number)),
        [x, lower, upper],
      ),

    append: <T>(list: T[], x: T): T[] => { list.push(x); return list; },
    contains: <T>(list: T[], x: T): boolean => list.includes(x),
    base: <T extends Unwrapped<unknown> | Primitive>(v: T, parents: Wrapped<unknown>[]): Wrapped<T> =>
      this.lift(v, this.baseInfo(v, parents.map((p) => this.valued(p)))),
    peek: <T>(wrapped: Wrapped<T>) => this.unwrap(wrapped),
    // Default for absent optional params (see SpecRuntime.undef / type.ts). `this`
    // here is the runtime object, so `this.base` is the op above. An absent arg
    // has no source, hence empty parents.
    get undef(): Wrapped<undefined> {
      return this.base(undefined, []);
    },
  };

  literal(_id: number, value: unknown) {
    const w = this.$.base(value as Unwrapped<unknown>, []);
    return w === value ? undefined : { result: w };
  }

  // for-in/of iterates natively, so a wrapped primitive RHS (a plain object,
  // not iterable) must be unwrapped before it hits the iteration protocol.
  // Objects/arrays keep their identity through peek and their elements are
  // stored Wrapped, so element info survives; string iteration yields raw
  // chars whose per-char info is currently lost (no iterator model yet).
  forInOfObject(_id: number, value: unknown, _isForIn: boolean) {
    const raw = this.$.peek(value as Wrapped<unknown>);
    return raw === value ? undefined : { result: raw };
  }

  binaryPre(_id: number, op: string, left: Wrapped, right: Wrapped) {
    const l = this.$.peek(left);
    const r = this.$.peek(right);
    const frame: BinFrame = { ty: 'bin', op, left, right };
    return { op, left: l, right: r, skip: Model.supportSyntax(op), frame };
  }

  binary(_id: number, _op: string, _l: Wrapped, _r: Wrapped, result: Unwrapped<unknown>, frame: unknown) {
    required(frame !== undefined, 'binary hook missing frame');
    const f = frame as BinFrame;
    if (Model.supportSyntax(f.op)) {
      return { result: Model.ofSyntax(f.op)(this.$, f.left, f.right) as Wrapped<unknown> };
    } else {
      // assert : result is given
      // The hook's own l/r are the peeked raws binaryPre handed to native
      // execution — info lives only on the frame's wrapped operands.
      const left = this.valued(f.left);
      const right = this.valued(f.right);
      const resultInfo = this.binaryInfo?.(f.op, left, right) ?? this.baseInfo(result, [left, right]);
      return { result: this.lift(result, resultInfo) };
    }
  }

  templateConcatPre(_id: number, left: Wrapped, right: Wrapped) {
    const l = this.$.peek(left);
    const r = this.$.peek(right);
    const frame: BinFrame = { ty: 'bin', op: '+', left, right };
    return { left: l, right: r, skip: true, frame };
  }

  templateConcat(_id: number, _left: Wrapped, _right: Wrapped, result: Unwrapped<unknown>, frame: unknown) {
    required(frame !== undefined, 'templateConcat hook missing frame');
    const f = frame as BinFrame;
    return { result: Model.ofSyntax('+')(this.$, f.left, f.right) as Wrapped<string> };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Wrapped) {
    const e = this.$.peek(operand);
    const frame: UnFrame = { ty: 'un', op, operand: operand };
    return { op, operand: e, skip: false, frame };
  }

  unary(_id: number, _op: string, _prefix: boolean, _operand: unknown, result: Unwrapped<unknown>, frame: unknown) {
    required(frame !== undefined, 'unary hook missing frame');
    const f = frame as UnFrame;
    const transformed : Wrapped<unknown> = this.lift(result, this.unaryInfo?.(f.op, this.valued(f.operand)) ?? this.baseInfo(result, [this.valued(f.operand)]));
    return { result: transformed };
  }

  getFieldPre(_id: number, base: any, prop: any) {
    // primitives are wrapped in plain objects with no prototype chain to String/Number/etc.,
    // so x.at would resolve to undefined. unwrap the base for the lookup; the call site still
    // sees the original wrapped base, so the model receives the wrapped `this`.
    // The key must be unwrapped too: a wrapped prop is a plain proxy object, so a
    // computed read `base[prop]` would coerce it to "[object Object]" and resolve to
    // undefined (e.g. arr[i], split's result[k]). The frame keeps the wrapped prop so
    // propagate still sees its info / can recover the s[i] char-access case.
    const frame: GetFieldFrame = { ty: 'getField', base: base as Wrapped, prop: prop as Wrapped };
    return { base: this.$.peek(base as Wrapped), prop: this.$.peek(prop as Wrapped), skip: false, frame };
  }

  getField(_id: number, _base: any, _prop: any, result: any, frame: unknown) {
    required(frame !== undefined, 'getField hook missing frame');
    const transformed = (() => {
      const f = frame as GetFieldFrame;
    const b: unknown = this.$.peek(f.base);
    const p: unknown = this.$.peek(f.prop);
    if (typeof b === 'string') {
      const i = asStringIndex(p, b.length);
      if (i !== undefined) {
        return this.$.substring(
          f.base as Wrapped<string>,
          this.$.base(i, []),
          this.$.base(i + 1, []),
        );
      }
      // `s.length` is the one field read with op-aware meaning (strlen);
      // route it through lengthInfo, else baseInfo flow-through.
      if (p === 'length') {
        if (this.$.isType(f.base, 'string')) {
          return this.lift(result, this.lengthOfStringInfo?.(this.valued(f.base as Wrapped<string>)) ?? this.baseInfo(result, [this.valued(f.base)]));
        } else {
          return this.lift(result, this.baseInfo(result, [this.valued(f.base)]));
        }
      }
    }
    // Object/array elements are stored as Wrapped values that already carry
    // their own info (e.g. split's substrings). Preserve it on read-back
    // instead of re-deriving from [base, prop] (which would drop it).
    if (this.isWrapped(result) && !this.domain.isBottom(this.getInfo(result))) {
      return result as Wrapped<unknown>;
    }
    return this.$.base(result, [f.base, f.prop]);
    })();
    return { result: transformed };
  }

  invokeFunPre(_id: number, _f: any, _base: any, args: any, _isConstructor: boolean, _isMethod: boolean) {
    const argArr = Array.from(args) as Wrapped[]; // can we do this without `as`?
    // For method calls (`o.m(...)`), the receiver `o` is also a data
    // dependency of the result — include it so baseInfo sees its taint.
    const entries: Wrapped[] = _isMethod ? [_base as Wrapped, ...argArr] : argArr;
    if (Model.support(_f)) {
      // model takes wrapped args and returns a wrapped result; runtime will dispatch via Model.of(f)
      return { skip: true, f: _f, base: _base, args: argArr, frame: { ty: 'opaque', f: _f, modeled: true, entries } };
    }


    if (this.policy.isOpaque(_f)) {
      const unwrappedArgs = argArr.map(this.$.peek);
      return { skip: false, f: _f, base: _base, args: unwrappedArgs, frame: { ty: 'opaque', f: _f, modeled: false, entries } };
    }
    return { skip: false, f: _f, base: _base, args, frame: { ty: 'transparent', entries } };
  }

  invokeFun(_id: number, _f: any, _base: any, _args: any, result: any, _isConstructor: boolean, _isMethod: boolean, frame: unknown) {
    required(frame !== undefined, 'invokeFun hook missing frame');
    if (Model.support(_f)) {
      let f : Function = Model.ofBuiltin(_f);
      result = f(this.$, _base as Wrapped, ...(_args as Wrapped[]));
    }

    const f = frame as CallFrame;
    const transformed = (() => {
          switch (f.ty) {
      case 'opaque': {
        // when modeled, the runtime invoked Model.of(f) which already returned a Wrapped value
        if (f.modeled) return result as unknown as Wrapped<unknown>;
        const parents = Array.from(f.entries) as Wrapped[]; // can we do this without `as`?
        return this.$.base(result, parents);
      }
      case 'transparent': {
        // Operations inside the callee already propagated info to `result`.
        // If we re-run baseInfo here we'd overwrite char-level info with a
        // coarser bit-only info derived from the args. Preserve any info the
        // callee attached; only fall back to base propagation when the callee
        // produced a value with no info (e.g. a literal return).
        if (this.isWrapped(result) && !this.domain.isBottom(this.getInfo(result))) {
          return result as Wrapped<unknown>;
        }
        const parents = Array.from(f.entries) as Wrapped[];
        return this.$.base(result, parents);
      }
    }
    })();

    return { result: transformed };
  }

  // wrappers
  private id = 0;
  private freshId() { return Symbol(this.id++); }

  private isObjectish(v: unknown): v is object | Function {
    return v !== null && (typeof v === "object" || typeof v === "function");
  }

  private isPrimitive(v: unknown): v is string | number | boolean | bigint | symbol | null | undefined {
    return !this.isObjectish(v);
  }

  private isWrapped(v: unknown): v is Wrapped<unknown> {
    return this.isObjectish(v) && this.valueMap.has(v);
  }

  private wrap<T>(value: T): Wrapped<T> {
    if (this.isObjectish(value)) {
      // Track objects/arrays/functions by identity so info can be attached.
      // Without this, spec.base on an object is silently info-less and taint
      // dies at any object boundary (e.g. split's result array → join).
      if (!this.valueMap.has(value as object)) {
        this.valueMap.set(value as object, { id: this.freshId(), value });
      }
      return value as Wrapped<T>;
    }
    const proxy = ({ [util.inspect.custom]() { return "<wrapped-primitive>"; } });
    this.primitiveWrapper.add(proxy);
    this.valueMap.set(proxy, { id: this.freshId(), value });
    return proxy as T as Wrapped<T>;
  }

  private unwrap<T = unknown>(value: Wrapped<T>): Unwrapped<T> {
    if (!this.isObjectish(value)) return value as T as Unwrapped<T>; // should not happen;
    const entry = this.valueMap.get(value);
    return entry === undefined ? value as T as Unwrapped<T> : entry.value as T as Unwrapped<T>;
  }

  private forcedUnwrap(value: unknown): IdValuePair {
    return this.valueMap.get(this.wrap(value)) as IdValuePair; // should not fail
  }

  private getEntry(value: unknown): IdValuePair | undefined {
    if (!this.isObjectish(value)) return undefined;
    return this.valueMap.get(value);
  }

}
