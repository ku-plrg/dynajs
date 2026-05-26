import util from "node:util";
import type { Wrapped, Unwrapped } from "./type.js";

type Entry = { id: symbol; value: unknown };

type TaintInfo = { bit: boolean; chars?: boolean[] };

export class Wrapper<Info> {

  primitiveWrapper = new WeakSet<object>();
  valueMap = new WeakMap<object, Entry>();
  // taintMap = new Map<symbol, Info>();

  constructor() { }

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

  // getOrCreateTaintInfo(id: symbol): Info {
  //   let t = this.taintMap.get(id);
  //   if (t === undefined) {
  //     t = { bit: false };
  //     this.taintMap.set(id, t);
  //   }
  //   return t;
  // }

  // isTainted(value: unknown): boolean {
  //   const e = this.getEntry(value);
  //   if (e === undefined) return false;
  //   const t = this.taintMap.get(e.id);
  //   if (t === undefined) return false;
  //   if (t.bit) return true;
  //   if (t.chars !== undefined) {
  //     for (const c of t.chars) if (c) return true;
  //   }
  //   return false;
  // }

  // isTaintedAt(value: unknown, index: number): boolean {
  //   const e = this.getEntry(value);
  //   if (e === undefined) return false;
  //   const t = this.taintMap.get(e.id);
  //   if (t === undefined) return false;
  //   if (t.chars !== undefined && index >= 0 && index < t.chars.length) {
  //     return t.chars[index] === true;
  //   }
  //   return t.bit;
  // }

  // setTaint(value: unknown, tainted: boolean): void {
  //   const e = this.getEntry(value);
  //   if (e === undefined) return;
  //   const t = this.getOrCreateTaintInfo(e.id);
  //   t.bit = tainted;
  //   if (typeof e.value === "string") {
  //     t.chars = Array.from({ length: (e.value as string).length }, () => tainted);
  //   }
  // }
}
