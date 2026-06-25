import type { TaintAnalysis } from './index.js';

declare const D$: { analysis: TaintAnalysis } & Record<string, any>;

function __set_taint__(v: unknown): unknown {
  D$.analysis.setTaint(v, true);
  return v;
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

// Assert whether taint reaches `v`. `expected` is this assert's ground truth
// (true = taint should have flowed here); the verdict marker the microbench
// runner reads carries actual-vs-expected, so a file can chain several asserts
// (positive and negative cases) that each score on their own.
function __assert_taint__(v: unknown, expected: unknown): void {
  D$.analysis.assertTaint(v, expected);
}

// Installs the ghost source/sink functions and returns them as the set of
// transparent callees: they run analysis code over lifted values, so they must
// NOT be stripped at the opaque boundary like a real native would be.
export function installPrelude(): ReadonlySet<unknown> {
  const g = globalThis as Record<string, unknown>;
  g.__set_taint__ = __set_taint__;
  g.__is_tainted__ = __is_tainted__;
  g.__is_tainted_at__ = __is_tainted_at__;
  g.__assert__ = __assert__;
  g.__assert_taint__ = __assert_taint__;
  return new Set<unknown>([
    __set_taint__,
    __is_tainted__,
    __is_tainted_at__,
    __assert__,
    __assert_taint__,
  ]);
}
