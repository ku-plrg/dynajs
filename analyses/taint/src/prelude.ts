import type { TaintAnalysis } from "./index.js";
import type { Wrapped, Unwrapped } from "@/model/type.js";

declare const D$: { analysis: TaintAnalysis } & Record<string, any>;

function __set_taint__(v: unknown): void {
  D$.analysis.taint.setTaint(v, true);
}

function __is_tainted__(v: unknown): boolean {
  return D$.analysis.taint.isTainted(v);
}

function __is_tainted_at__(v: unknown, index: unknown): boolean {
  const raw = D$.analysis.wrapper.unwrap(index as Wrapped<unknown>);
  const idx = typeof raw === "number" ? raw : Number(raw);
  return D$.analysis.taint.isTaintedAt(v, idx);
}

function __assert__(v: unknown): void {
  if (D$.analysis.wrapper.unwrap(v as Wrapped<unknown>)) return;
  throw new Error("Assertion failed");
}

export function installPrelude(): void {
  const g = globalThis as Record<string, unknown>;
  g.__set_taint__ = __set_taint__;
  g.__is_tainted__ = __is_tainted__;
  g.__is_tainted_at__ = __is_tainted_at__;
  g.__assert__ = __assert__;
}
