import util from "node:util";

export type Entry = { id: number; value: unknown };
const valueMap = new WeakMap<object, Entry>();
export const taintMap = new Map<number, boolean>();

const freshId = (() => {
  let id = 0;
  return () => id++;
})();

function isObjectish(v: unknown): v is object | Function {
  return v !== null && (typeof v === "object" || typeof v === "function");
}

function isPrimitive(v: unknown): v is string | number | boolean | bigint | symbol | null | undefined {
  return v === null || (typeof v !== "object" && typeof v !== "function");
}

export function isWrapped(v: unknown): boolean {
  return isObjectish(v) && valueMap.has(v);
}

export function wrap(value: unknown): object {
  if (!isPrimitive(value)) return value;
  const proxy = ({ [util.inspect.custom]() { return "<wrapped>"; } }); // new Proxy({ toString: () => "<wrapped>" }, {});
  valueMap.set(proxy, { id: freshId(), value });
  return proxy;
}

export function unwrap(value: unknown): unknown {
  if (!isObjectish(value)) return value; // should not happen;
  const entry = valueMap.get(value);
  return entry === undefined ? value : entry.value;
}

export function forcedUnwrap(value: unknown): Entry {
  return valueMap.get(wrap(value)) as Entry; // should not fail
}

export function getEntry(value: unknown): Entry | undefined {
  if (!isObjectish(value)) return undefined;
  return valueMap.get(value);
}

export function isTainted(value: unknown): boolean {
  const e = getEntry(value);
  if (e === undefined) return false;
  return taintMap.get(e.id) === true;
}

export function setTaint(value: unknown, tainted: boolean): void {
  const e = getEntry(value);
  if (e) taintMap.set(e.id, tainted);
}

export function __set_taint__(v: unknown): void {
  setTaint(v, true);
}

export function __is_tainted__(v: unknown): boolean {
  return isTainted(v);
}

export function __assert__(v: unknown): void {
  if (v) return;
  throw new Error("Assertion failed");
}

export function installPrelude(): void {
  const g = globalThis as Record<string, unknown>;
  g.__set_taint__ = __set_taint__;
  g.__is_tainted__ = __is_tainted__;
  g.__assert__ = __assert__;
}
