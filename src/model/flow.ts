import util from "node:util";
import type { Analysis } from "@/types/analysis.js";
import type { SpecOps, Wrapped, Unwrapped, Primitive } from "./type.js";

type Entry = { id: symbol; value: unknown };

type Frame = BinFrame | UnFrame | CallFrame;
export type BinFrame = { ty: 'bin'; op: string; left: Wrapped; right: Wrapped };
export type UnFrame  = { ty: 'un'; op: string; operand: Wrapped };

type CallFrame = OpaqueCall | TransparentCall;
export type OpaqueCall = { ty: 'opaque'; entries: unknown[] };
export type TransparentCall = { ty: 'transparent', entries: unknown[] };

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

  protected propagate(frame: Frame, result: Unwrapped<unknown>): Wrapped<unknown> {
    switch (frame.ty) {
      case 'bin': {
        const lstr /* : fleft is Wrapped<string> */ = typeof this.spec.peek(frame.left) === 'string';
        const rstr /* : fright is Wrapped<string> */ = typeof this.spec.peek(frame.right) === 'string';
        if (frame.op === '+' && lstr && rstr && this.spec.concatenate) {
          return this.spec.concatenate(frame.left as Wrapped<string>, frame.right as Wrapped<string>);
        }
        const parents = [frame.left, frame.right];
        return this.spec.base(result, parents);
      }
      case 'un': {
        const parents = [frame.operand];
        return this.spec.base(result, parents);
      }
      case 'opaque': {
        // built-in function model
        const parents = Array.from(frame.entries) as Wrapped[]; // can we do this without `as`?
        return this.spec.base(result, parents);
      }
      case 'transparent': {
        // CHECK isn't this already handled by the callee?
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

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Wrapped) {
    const e = this.spec.peek(operand);
    const frame: UnFrame = { ty: 'un', op, operand: operand };
    return { op, operand: e, skip: false, frame };
  }

  unary(_id: number, _op: string, _prefix: boolean, _operand: unknown, result: Unwrapped<unknown>, frame?: unknown) {
    return { result: this.propagate(frame as UnFrame, result) };
  }

  invokeFunPre(_id: number, _f: any, _base: any, args: any, _isConstructor: boolean, _isMethod: boolean) {
    const argArr = Array.from(args) as Wrapped[]; // can we do this without `as`?
    if (this.isOpaqueFunction(_f)) {
      const unwrappedArgs = argArr.map(this.spec.peek);
      // TODO : use model
      return { skip: false, f: _f, base: _base, args: unwrappedArgs, preferModel: false, frame: { ty: 'opaque', entries: argArr } };
    }
    return { skip: false, f: _f, base: _base, args, preferModel: false, frame: { ty: 'transparent', entries: argArr } };
  }

  invokeFun(_id: number, _f: any, _base: any, _args: any, result: any, _isConstructor: boolean, _isMethod: boolean, frame?: unknown) {
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
    if (this.isObjectish(value)) return value as Wrapped<T>;
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
