import type { TaintAnalysis } from "./index.js";

declare const D$: { analysis: TaintAnalysis } & Record<string, any>;

function __set_taint__(v: unknown): void {
  D$.analysis.setTaint(v, true);
}

function __is_tainted__(v: unknown): boolean {
  return D$.analysis.isTainted(v);
}

function __is_tainted_at__(v: unknown, index: unknown): boolean {
  return D$.analysis.isTaintedAt(v, index);
}

function __assert__(v: unknown): void {
  D$.analysis.assert(v);
}

function __print_if_tainted__(x: unknown): void {
  if (D$.analysis.isTainted(x)) {
    console.log("@@DJX_VERDICT detected");
  } else {
    console.log("@@DJX_VERDICT clean");
  }
}

export function installPrelude(): void {
  const g = globalThis as Record<string, unknown>;
  g.__set_taint__ = __set_taint__;
  g.__is_tainted__ = __is_tainted__;
  g.__is_tainted_at__ = __is_tainted_at__;
  g.__assert__ = __assert__;
  g.__print_if_tainted__ = __print_if_tainted__;
}
