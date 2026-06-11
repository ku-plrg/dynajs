import util from "node:util";
import type { Analysis } from "@/types/analysis.js";
import type { SpecOps, BootStrap, Wrapped, Unwrapped, Primitive } from "./type.js";
import { Model } from "./model.js";

type IdValuePair = { id: symbol; value: unknown };

type Frame = BinFrame | UnFrame | CallFrame | GetFieldFrame;
export type BinFrame = { ty: 'bin'; op: string; left: Wrapped; right: Wrapped };
export type UnFrame  = { ty: 'un'; op: string; operand: Wrapped };
export type GetFieldFrame = { ty: 'getField'; base: Wrapped; prop: Wrapped };

type CallFrame = OpaqueCall | TransparentCall;
export type OpaqueCall = { ty: 'opaque'; f: unknown; modeled: boolean; entries: unknown[] };
export type TransparentCall = { ty: 'transparent', entries: unknown[] };

// The user-facing view of a value: its concrete `value` plus the analysis `info`
// attached to it (`info` is undefined when nothing has been attached yet). This
// is the only currency the Info hooks speak — the framework projects each
// internal `Wrapped` into a `Valued` before calling a hook, so a user analysis
// never has to touch `Wrapped`/`Unwrapped`.
export type Valued<Info> = { info: Info | undefined; value: unknown };

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
  protected abstract baseInfo(value: unknown, parents: Valued<Info>[]): Info | undefined;

  // String structure.
  protected substringInfo(_src: Valued<Info>, _start: number, _resultLength: number): Info | undefined { return undefined; }
  protected concatenateInfo(_left: Valued<Info>, _leftLength: number, _right: Valued<Info>, _rightLength: number): Info | undefined { return undefined; }
  // Arithmetic (`+ - * / …`) and ordering comparisons (`< <= > >=`).
  protected binaryInfo(_op: string, _left: Valued<Info>, _right: Valued<Info>): Info | undefined { return undefined; }
  protected unaryInfo(_op: string, _operand: Valued<Info>): Info | undefined { return undefined; }
  protected lengthInfo(_src: Valued<Info>): Info | undefined { return undefined; }
  // ToIntegerOrInfinity's truncate-toward-zero, so a symbolic numeric operand
  // keeps its Sym across the integer coercion (e.g. a symbolic index).
  protected truncateInfo(_src: Valued<Info>): Info | undefined { return undefined; }
  // A branch was taken on `cond` (concrete direction `taken`), keyed by the
  // branch's source `id`. Unlike the hooks above this produces no new value — it
  // records a fact (a path constraint), so it returns void. Path-tracking
  // analyses (concolic) override it; everyone else ignores branches.
  protected conditionInfo(_id: number, _cond: Valued<Info>, _taken: boolean): void {}

  // ---- Info storage helpers ----

  protected getInfo(value: unknown): Info | undefined {
    const e = this.getEntry(value);
    return e === undefined ? undefined : this.infoMap.get(e.id);
  }

  protected setInfo(value: unknown, info: Info): void {
    const e = this.getEntry(value);
    if (e === undefined) return;
    this.infoMap.set(e.id, info);
  }

  protected getOrCreateInfo(value: unknown, makeEmpty: () => Info): Info | undefined {
    const e = this.getEntry(value);
    if (e === undefined) return undefined;
    let info = this.infoMap.get(e.id);
    if (info === undefined) {
      info = makeEmpty();
      this.infoMap.set(e.id, info);
    }
    return info;
  }

  // Project a wrapped value into the user-facing `Valued` view (its concrete
  // value + attached info). Used internally to feed the Info hooks, and exposed
  // (protected) so an analysis's own entry points — e.g. prelude bridges that
  // receive wrapped values — can speak `Valued` too instead of `Wrapped`.
  protected valued(w: unknown): Valued<Info> {
    return { info: this.getInfo(w), value: this.unwrap(w as Wrapped<unknown>) };
  }

  // Wrap a freshly-computed result and attach `info` if any. The one place the
  // wrap+setInfo dance lives, so every op below is a one-liner.
  private lift<T>(value: T, info: Info | undefined): Wrapped<T> {
    const w = this.wrap(value);
    if (info !== undefined) this.setInfo(w, info);
    return w;
  }

  // ---- SpecOps: wrap/unwrap plumbing; Info computation delegated to hooks ----

  spec: SpecOps = {
    base: <T extends Unwrapped<unknown> | Primitive>(v: T, parents: Wrapped<unknown>[]): Wrapped<T> =>
      this.lift(v, this.baseInfo(v, parents.map((p) => this.valued(p)))),
    binary: (op: string, left: Wrapped, right: Wrapped, result: Unwrapped): Wrapped =>
      this.lift(result, this.binaryInfo(op, this.valued(left), this.valued(right)) ?? this.baseInfo(result, [this.valued(left), this.valued(right)])),
    peek: <T>(wrapped: Wrapped<T>) => this.unwrap(wrapped),
    substring: (s: Wrapped<string>, start: Wrapped<number>, end: Wrapped<number>): Wrapped<string> => {
      const r = this.unwrap(s).substring(this.unwrap(start) as number, this.unwrap(end) as number);
      return this.lift(r, this.substringInfo(this.valued(s), this.unwrap(start) as number, r.length) ?? this.baseInfo(r, [this.valued(s)]));
    },
    concatenate: (s1: Wrapped<string>, s2: Wrapped<string>): Wrapped<string> => {
      const r1 = this.unwrap(s1);
      const r2 = this.unwrap(s2);
      const r = r1 + r2;
      return this.lift(r, this.concatenateInfo(this.valued(s1), r1.length, this.valued(s2), r2.length) ?? this.baseInfo(r, [this.valued(s1), this.valued(s2)]));
    },
  };

  // Wrap a freshly-computed numeric result, propagating Info from its operands
  // exactly like base() does. Used by the math runtime ops (min/max/abs/…) that
  // have no op-aware Sym yet.
  private numOp(v: number, parents: Wrapped<unknown>[]): Wrapped<number> {
    return this.lift(v, this.baseInfo(v, parents.map((p) => this.valued(p))));
  }

  // Wrap a binary arithmetic result — same post-hoc op-aware annotation as the
  // user-code path (`spec.binary`): op-aware analyses build the operator Sym via
  // binaryInfo, everyone else falls back to baseInfo flow-through (taint).
  private binOp(op: string, l: Wrapped<number>, r: Wrapped<number>, v: number): Wrapped<number> {
    return this.spec.binary(op, l, r, v as unknown as Unwrapped) as Wrapped<number>;
  }

  // Wrap a unary arithmetic result (op-aware Sym, else baseInfo flow-through).
  private unOp(op: string, x: Wrapped<number>, v: number): Wrapped<number> {
    return this.lift(v, this.unaryInfo(op, this.valued(x)) ?? this.baseInfo(v, [this.valued(x)]));
  }

  // Wrap an ordering comparison's result: its comparison Sym (via binaryInfo)
  // else baseInfo flow-through, like the arithmetic ops — so a comparison result
  // carries its operands' Info (taint flows into the boolean; concolic attaches
  // the comparison Sym). The Wrapped<boolean> is a truthy proxy, so a caller must
  // funnel it through `condition` before any native branch — generated code does
  // this at the branch site (see BootStrap.condition / type.ts).
  private cmpOp(op: string, l: Wrapped<number>, r: Wrapped<number>, v: boolean): Wrapped<boolean> {
    return this.spec.binary(op, l, r, v as unknown as Unwrapped) as Wrapped<boolean>;
  }

  // A branch point. Unwrap so native control flow sees the raw boolean, and hand
  // the condition to the `conditionInfo` hook so a path-tracking analysis can
  // record it. This is the same hook the instrumenter dispatches to for
  // `D$.C(id, op, value)` on user code AND the one model-internal branches funnel
  // through (BootStrap.condition), so both go through one place.
  condition(id: number, _op: string, value: unknown): { result: unknown } {
    const raw = this.unwrap(value as Wrapped<unknown>);
    this.conditionInfo(id, this.valued(value), Boolean(raw));
    return { result: raw };
  }

  // The runtime threaded into generated polyfills as `$`. Every operation on a
  // value goes through here. Arithmetic and ordering comparisons carry the
  // result (Wrapped, to keep the symbolic value flowing); `condition` unwraps a
  // comparison at the branch site so native control flow / short-circuiting work.
  runtime: BootStrap = {
    length: (s) => {
      const v = (this.unwrap(s) as string).length;
      return this.lift(v, this.lengthInfo(this.valued(s)) ?? this.baseInfo(v, [this.valued(s)]));
    },
    substring: (s, from, to) => {
      const startN = this.unwrap(from) as number;
      const r = (this.unwrap(s) as string).substring(startN, this.unwrap(to) as number);
      return this.lift(r, this.substringInfo(this.valued(s), startN, r.length) ?? this.baseInfo(r, [this.valued(s)]));
    },
    concatenate: (l, r) => {
      const r1 = this.unwrap(l);
      const r2 = this.unwrap(r);
      const res = r1 + r2;
      return this.lift(res, this.concatenateInfo(this.valued(l), r1.length, this.valued(r), r2.length) ?? this.baseInfo(res, [this.valued(l), this.valued(r)]));
    },
    codeUnitAt: (s, i) => {
      const idx = this.unwrap(i) as number;
      const r = (this.unwrap(s) as string).charAt(idx);
      return this.lift(r, this.substringInfo(this.valued(s), idx, r.length) ?? this.baseInfo(r, [this.valued(s)]));
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
      return this.lift(v, this.truncateInfo(this.valued(x)) ?? this.baseInfo(v, [this.valued(x)]));
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
    // Default for absent optional params (see BootStrap.undef / type.ts). `this`
    // here is the runtime object, so `this.base` is the op above. An absent arg
    // has no source, hence empty parents.
    get undef(): Wrapped<undefined> {
      return this.base(undefined, []);
    },
  };

  private model = new Model(this.spec, this.runtime);

  protected propagate(frame: Frame, result: Unwrapped<unknown>): Wrapped<unknown> {
    switch (frame.ty) {
      case 'bin': {
        return this.model.applyBinary(frame.left, frame.op, frame.right, result);
      }
      case 'un': {
        // Op-aware unary annotation (concolic builds `{unary, op}`), else baseInfo
        // flow-through. Same contract as spec.binary, but inline since propagate
        // can reach the hook directly (unlike binary, which crosses into Model).
        return this.lift(result, this.unaryInfo(frame.op, this.valued(frame.operand)) ?? this.baseInfo(result, [this.valued(frame.operand)]));
      }
      case 'getField': {
        const b: unknown = this.spec.peek(frame.base);
        const p: unknown = this.spec.peek(frame.prop);
        if (typeof b === 'string') {
          const i = asStringIndex(p, b.length);
          if (i !== undefined) {
            return this.spec.substring(
              frame.base as Wrapped<string>,
              this.spec.base(i, []),
              this.spec.base(i + 1, []),
            );
          }
          // `s.length` is the one field read with op-aware meaning (strlen);
          // route it through lengthInfo, else baseInfo flow-through.
          if (p === 'length') {
            return this.lift(result, this.lengthInfo(this.valued(frame.base)) ?? this.baseInfo(result, [this.valued(frame.base)]));
          }
        }
        // Object/array elements are stored as Wrapped values that already carry
        // their own info (e.g. split's substrings). Preserve it on read-back
        // instead of re-deriving from [base, prop] (which would drop it).
        if (this.isWrapped(result) && this.getInfo(result) !== undefined) {
          return result as Wrapped<unknown>;
        }
        return this.spec.base(result, [frame.base, frame.prop]);
      }
      case 'opaque': {
        // when modeled, the runtime invoked Model.of(f) which already returned a Wrapped value
        if (frame.modeled) return result as unknown as Wrapped<unknown>;
        const parents = Array.from(frame.entries) as Wrapped[]; // can we do this without `as`?
        return this.spec.base(result, parents);
      }
      case 'transparent': {
        // Operations inside the callee already propagated info to `result`.
        // If we re-run baseInfo here we'd overwrite char-level info with a
        // coarser bit-only info derived from the args. Preserve any info the
        // callee attached; only fall back to base propagation when the callee
        // produced a value with no info (e.g. a literal return).
        if (this.isWrapped(result) && this.getInfo(result) !== undefined) {
          return result as Wrapped<unknown>;
        }
        const parents = Array.from(frame.entries) as Wrapped[];
        return this.spec.base(result, parents);
      }
    }
  }

  protected abstract isOpaqueFunction(_f: unknown): unknown

  literal(_id: number, value: unknown) {
    const w = this.spec.base(value as Unwrapped<unknown>, []);
    return w === value ? undefined : { result: w };
  }

  binaryPre(_id: number, op: string, left: Wrapped, right: Wrapped) {
    const l = this.spec.peek(left);
    const r = this.spec.peek(right);
    const frame: BinFrame = { ty: 'bin', op, left, right };
    return { op, left: l, right: r, skip: false, frame };
  }

  binary(_id: number, _op: string, _l: Wrapped, _r: Wrapped, result: Unwrapped<unknown>, frame?: unknown) {
    return { result: this.propagate(frame as BinFrame, result) };
  }

  templateConcatPre(_id: number, left: Wrapped, right: Wrapped) {
    const l = this.spec.peek(left);
    const r = this.spec.peek(right);
    const frame: BinFrame = { ty: 'bin', op: '+', left, right };
    return { left: l, right: r, skip: false, frame };
  }

  templateConcat(_id: number, _left: Wrapped, _right: Wrapped, result: Unwrapped<unknown>, frame?: unknown) {
    return { result: this.propagate(frame as BinFrame, result) };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Wrapped) {
    const e = this.spec.peek(operand);
    const frame: UnFrame = { ty: 'un', op, operand: operand };
    return { op, operand: e, skip: false, frame };
  }

  unary(_id: number, _op: string, _prefix: boolean, _operand: unknown, result: Unwrapped<unknown>, frame?: unknown) {
    return { result: this.propagate(frame as UnFrame, result) };
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
    return { base: this.spec.peek(base as Wrapped), prop: this.spec.peek(prop as Wrapped), skip: false, frame };
  }

  getField(_id: number, _base: any, _prop: any, result: any, frame?: unknown) {
    return { result: this.propagate(frame as GetFieldFrame, result) };
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


    if (this.isOpaqueFunction(_f)) {
      const unwrappedArgs = argArr.map(this.spec.peek);
      return { skip: false, f: _f, base: _base, args: unwrappedArgs, frame: { ty: 'opaque', f: _f, modeled: false, entries } };
    }
    return { skip: false, f: _f, base: _base, args, frame: { ty: 'transparent', entries } };
  }

  invokeFun(_id: number, _f: any, _base: any, _args: any, result: any, _isConstructor: boolean, _isMethod: boolean, frame?: unknown) {
    if (Model.support(_f)) {
      let f : Function = new Model(this.spec, this.runtime).of(_f);
      result = f(this.runtime, _base as Wrapped, ...(_args as Wrapped[]));
    }
    return { result: this.propagate(frame as CallFrame, result) };
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
