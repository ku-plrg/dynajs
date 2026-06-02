import util from "node:util";
import type { Analysis } from "@/types/analysis.js";
import type { SpecOps, Wrapped, Unwrapped, Primitive } from "./type.js";
import { Model } from "./model.js";

type Entry = { id: symbol; value: unknown };

type Frame = BinFrame | UnFrame | CallFrame | GetFieldFrame;
export type BinFrame = { ty: 'bin'; op: string; left: Wrapped; right: Wrapped };
export type UnFrame  = { ty: 'un'; op: string; operand: Wrapped };
export type GetFieldFrame = { ty: 'getField'; base: Wrapped; prop: Wrapped };

type CallFrame = OpaqueCall | TransparentCall;
export type OpaqueCall = { ty: 'opaque'; f: unknown; modeled: boolean; entries: unknown[] };
export type TransparentCall = { ty: 'transparent', entries: unknown[] };

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
  private valueMap = new WeakMap<object, Entry>();
  private infoMap = new Map<symbol, Info>();

  // ---- Info hooks (subclasses implement only these) ----

  protected abstract baseInfo(value: unknown, parents: (Info | undefined)[]): Info | undefined;
  protected abstract substringInfo(src: Info | undefined, start: number, resultLength: number): Info | undefined;
  protected abstract concatenateInfo(left: Info | undefined, leftLength: number, right: Info | undefined, rightLength: number): Info | undefined;

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

  // ---- SpecOps: wrap/unwrap plumbing; Info computation delegated to hooks ----

  spec: SpecOps = {
    base: <T extends Unwrapped<unknown> | Primitive>(v: T, parents: Wrapped<unknown>[]): Wrapped<T> => {
      const w = this.wrap(v);
      const info = this.baseInfo(v, parents.map((p) => this.getInfo(p)));
      if (info !== undefined) this.setInfo(w, info);
      return w;
    },
    peek: <T>(wrapped: Wrapped<T>) => this.unwrap(wrapped),
    substring: (s: Wrapped<string>, start: Wrapped<number>, end: Wrapped<number>): Wrapped<string> => {
      const raw = this.unwrap(s);
      const startN = this.unwrap(start) as number;
      const endN = this.unwrap(end) as number;
      const r = raw.substring(startN, endN);
      const w = this.wrap(r);
      const info = this.substringInfo(this.getInfo(s), startN, r.length);
      if (info !== undefined) this.setInfo(w, info);
      return w;
    },
    concatenate: (s1: Wrapped<string>, s2: Wrapped<string>): Wrapped<string> => {
      const r1 = this.unwrap(s1);
      const r2 = this.unwrap(s2);
      const r = r1 + r2;
      const w = this.wrap(r);
      const info = this.concatenateInfo(this.getInfo(s1), r1.length, this.getInfo(s2), r2.length);
      if (info !== undefined) this.setInfo(w, info);
      return w;
    },
  };

  private model = new Model(this.spec);

  protected propagate(frame: Frame, result: Unwrapped<unknown>): Wrapped<unknown> {
    switch (frame.ty) {
      case 'bin': {
        return this.model.applyBinary(frame.left, frame.op, frame.right, result);
      }
      case 'un': {
        const parents = [frame.operand];
        return this.spec.base(result, parents);
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
    const frame: GetFieldFrame = { ty: 'getField', base: base as Wrapped, prop: prop as Wrapped };
    return { base: this.spec.peek(base as Wrapped), prop, skip: false, frame };
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
      result = new Model(this.spec).of(_f)(_base, ..._args);
    }
    return { result: this.propagate(frame as CallFrame, result) };
  }

  // wrappers

   private id = 0;
  freshId() { return Symbol(this.id++); }

  isObjectish(v: unknown): v is object | Function {
    return v !== null && (typeof v === "object" || typeof v === "function");
  }

  isPrimitive(v: unknown): v is string | number | boolean | bigint | symbol | null | undefined {
    return !this.isObjectish(v);
  }

  isWrapped(v: unknown): v is Wrapped<unknown> {
    return this.isObjectish(v) && this.valueMap.has(v);
  }

  wrap<T>(value: T): Wrapped<T> {
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

  unwrap<T = unknown>(value: Wrapped<T>): Unwrapped<T> {
    if (!this.isObjectish(value)) return value as T as Unwrapped<T>; // should not happen;
    const entry = this.valueMap.get(value);
    return entry === undefined ? value as T as Unwrapped<T> : entry.value as T as Unwrapped<T>;
  }

  forcedUnwrap(value: unknown): Entry {
    return this.valueMap.get(this.wrap(value)) as Entry; // should not fail
  }

  getEntry<E>(value: unknown): Entry | undefined {
    if (!this.isObjectish(value)) return undefined;
    return this.valueMap.get(value);
  }

}
