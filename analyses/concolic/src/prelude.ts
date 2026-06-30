import type { ConcolicAnalysis } from './index.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

function __symbolic__(name: unknown, seed: unknown): unknown {
  return D$.analysis.makeSymbolic(name, seed);
}

function __symbolic_assert__(cond: unknown, expected: unknown): void {
  D$.analysis.symbolicAssert(cond, expected);
}

function __IS_SAT__(cond: unknown, expected: unknown): void {
  D$.analysis.isSat(cond, expected);
}

function __s_symbol__(name: unknown, seed: unknown): unknown {
  return D$.analysis.symbolNamed(name, seed);
}

// Typeless symbol (no seed); forks across types via pureSymbolNamed (M8).
function __s_pure__(name: unknown): unknown {
  return D$.analysis.pureSymbolNamed(name);
}

export function installPrelude(): ReadonlySet<unknown> {
  const g = globalThis as Record<string, unknown>;
  g.__symbolic__ = __symbolic__;
  g.__symbolic_assert__ = __symbolic_assert__;
  g.__IS_SAT__ = __IS_SAT__;
  g.__s_symbol__ = __s_symbol__;
  g.__s_pure__ = __s_pure__;
  return new Set<unknown>([
    __symbolic__,
    __symbolic_assert__,
    __IS_SAT__,
    __s_symbol__,
    __s_pure__,
  ]);
}
