import util from "node:util";
import { required } from "@/utils.js";
import type { Analysis } from "@/types/analysis.js";
import type { SpecRuntime, Wrapped, Unwrapped, Primitive } from "./type.js";
import { Model } from "./model.js";
import { type Site, UNKNOWN_SITE, resolveCodeSite, builtinName } from "./site.js";
import { BoundaryEscape, type EscapeRecord } from "./escape.js";

type ValuedGeneral<Shape extends {}, Value = unknown> = Shape & { value: Value };

type IdValuePair = ValuedGeneral<{ id: symbol}, unknown>;

type BinFrame = { ty: 'bin'; op: string; left: Wrapped; right: Wrapped };
type UnFrame  = { ty: 'un'; op: string; operand: Wrapped };
type GetFieldFrame = { ty: 'getField'; base: Wrapped; prop: Wrapped };

type CallFrame = OpaqueCall | TransparentCall;
type OpaqueCall = { ty: 'opaque'; f: unknown; modeled: boolean; entries: unknown[]; escaped: EscapeRecord[] };
type TransparentCall = { ty: 'transparent', entries: unknown[] };

function isInstrumentedFn(f: unknown): boolean {
  const d$ = (globalThis as { D$?: { isInstrumented?: (f: unknown) => boolean } }).D$;
  return d$?.isInstrumented?.(f) ?? false;
}

export type Valued<Info, Value = unknown> = ValuedGeneral<{ 'info': Info | undefined }, Value>;

export type InfoDomain<Info> = {
  getBottom: () => Info;
  isBottom: (info: Info) => boolean;
}

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

  private currentId: number | undefined = undefined;
  private currentBuiltin: string | undefined = undefined;

  private escaper = new BoundaryEscape(this.isPrimitiveProxy.bind(this), this.unwrap.bind(this));

  protected site(): Site {
    if (this.currentBuiltin !== undefined) {
      const call = this.currentId !== undefined ? resolveCodeSite(this.currentId) : UNKNOWN_SITE;
      return { kind: 'builtin', name: this.currentBuiltin, call: call.kind === 'code' ? call : undefined };
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
      typeof f === 'function' && !isInstrumentedFn(f) && !this.transparentCalls.has(f),
  };

  protected abstract baseInfo(value: unknown, parents: Valued<Info>[]): Info;

  // String structure.
  protected substringInfo?(_src: Valued<Info, string>, _start: number, _resultLength: number): Info
  protected concatenateInfo?(_left: Valued<Info, string>, _leftLength: number, _right: Valued<Info, string>, _rightLength: number): Info
  protected lengthOfStringInfo?(_src: Valued<Info, string>): Info

  protected binaryInfo?(_op: string, _left: Valued<Info>, _right: Valued<Info>): Info
  protected unaryInfo?(_op: string, _operand: Valued<Info>): Info
  protected truncateInfo?(_src: Valued<Info, number>): Info

  protected conditionInfo?(_id: number, _cond: Valued<Info>, _taken: boolean): void {}

  protected escapedInfo?(_f: unknown, _escaped: Valued<Info>[]): void {}

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

  // Dual of `valued` ({value, info} ⇒ Wrapped): construct a wrapped value carrying
  // `value` as its concrete payload and `info` as its attached Info. Lets an
  // analysis *introduce* a value into the flow — concolic replay, fuzz/mutation
  // inputs — not only annotate existing ones. `info` defaults to bottom for a
  // plain wrapped concrete.
  protected make<V>(value: V, info: Info = this.domain.getBottom()): Wrapped<V> {
    return this.lift(value, info);
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
    // User-code branches carry a globally-unique id → a code site. Model-internal
    // branches (SpecRuntime.condition, op === 'model') use function-local bids
    // that collide with user ids, so don't resolve them as code: inside a model
    // dispatch `currentBuiltin` is already set, so site() reports the builtin.
    if (_op !== 'model') this.currentId = id;
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

    append: <T>(list: T[], x: T): T[] => { this.escaper.markEscapable(x); list.push(x); return list; },
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
    this.currentId = _id;
    this.escaper.markEscapableLiteral(value);
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
    // A binary op (including `+`/template via SYNTAX__add) attributes to the
    // user-code site, like NodeMedic stamps the source location on `binary`.
    this.currentId = _id;
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
    this.currentId = _id;
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
    this.currentId = _id;
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
    this.currentId = _id;
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

  putFieldPre(_id: number, base: any, prop: any, value: any) {
    const rawBase: unknown = this.$.peek(base as Wrapped);
    let v: unknown = value;
    if (ArrayBuffer.isView(rawBase)) {
      v = this.$.peek(value as Wrapped);
    } else {
      this.escaper.markEscapable(value);
    }
    return { base: rawBase, prop: this.$.peek(prop as Wrapped), value: v, skip: false };
  }

  // Class field initializers store natively, like a putField.
  fieldInit(_id: number, _obj: any, _key: any, _isStatic: boolean, value: any) {
    this.escaper.markEscapable(value);
  }

  invokeFunPre(_id: number, _f: any, _base: any, args: any, _isConstructor: boolean, _isMethod: boolean) {
    this.currentId = _id;
    const argArr = Array.from(args) as Wrapped[]; // can we do this without `as`?
    const entries: Wrapped[] = _isMethod ? [_base as Wrapped, ...argArr] : argArr;
    if (Model.support(_f) && !(entries.every((e) =>
      this.isPrimitive(this.$.peek(e)) && this.domain.isBottom(this.getInfo(e))))) {
      // model takes wrapped args and returns a wrapped result; runtime will dispatch via Model.of(f)
      return { skip: true, f: _f, base: _base, args: argArr, frame: { ty: 'opaque', f: _f, modeled: true, entries, escaped: [] } };
    }
    // fall through: A modeled builtin with all-bottom-primitive inputs


    if (this.policy.isOpaque(_f)) {
      const esc = this.escaper.escape(_base, argArr, entries);
      if (esc.crossed.length > 0) this.escapedInfo?.(_f, esc.crossed.map((w) => this.valued(w)));
      return { skip: false, f: _f, base: esc.base, args: esc.args, frame: { ty: 'opaque', f: _f, modeled: false, entries, escaped: esc.log } };
    }
    return { skip: false, f: _f, base: _base, args, frame: { ty: 'transparent', entries } };
  }

  invokeFun(_id: number, _f: any, _base: any, _args: any, result: any, _isConstructor: boolean, _isMethod: boolean, frame: unknown) {
    required(frame !== undefined, 'invokeFun hook missing frame');
    this.currentId = _id;
    const f = frame as CallFrame;
    if (f.ty === 'opaque' && f.modeled) {
      const modelFn = Model.ofBuiltin(_f);
      result = this.withBuiltinSite(builtinName(_f), () => modelFn(this.$, _base as Wrapped, ...(_args as Wrapped[])));
    }

    const transformed = (() => {
          switch (f.ty) {
      case 'opaque': {
        // when modeled, the model dispatched above already returned a Wrapped value
        if (f.modeled) return result as unknown as Wrapped<unknown>;
        if (f.escaped.length > 0) this.escaper.restore(f.escaped);
        if (this.isWrapped(result) && !this.domain.isBottom(this.getInfo(result))) {
          return result as Wrapped<unknown>;
        }
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

  private isPrimitiveProxy(v: unknown): v is Wrapped<unknown> {
    return this.isObjectish(v) && this.primitiveWrapper.has(v);
  }

  private wrap<T>(value: T): Wrapped<T> {
    if (this.isObjectish(value)) {
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
