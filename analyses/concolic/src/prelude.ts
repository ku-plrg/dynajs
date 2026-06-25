import type { ConcolicAnalysis } from './index.js';

declare const D$: { analysis: ConcolicAnalysis } & Record<string, any>;

// Introduce a fresh symbolic variable named `name`. `seed` is the *concrete*
// value the program actually runs with (it decides which branch is taken, i.e.
// which path condition we collect); `name` is the SMT-level variable the
// gathered constraints are phrased over. Returns the seed so execution proceeds
// normally, but tagged symbolic so downstream ops build up its symbolic form.
function __symbolic__(name: unknown, seed: unknown): unknown {
  return D$.analysis.makeSymbolic(name, seed);
}

// Complete an assertion *symbolically*: instead of checking `cond` on the
// current concrete values, we hand z3 the conjunction of path conditions taken
// to reach here together with `cond`, and ask whether `cond` is necessarily
// true under that path condition (i.e. `PC ∧ ¬cond` is UNSAT). `expected` is the
// bench's ground truth for THIS assert (true = should be detected/valid); we
// print the `@@DJX_VERDICT <actual> <expected>` marker the microbench runner
// reads, so several asserts in one file each score independently.
function __symbolic_assert__(cond: unknown, expected: unknown): void {
  D$.analysis.symbolicAssert(cond, expected);
}

// SAT-query assertion: the dual of `__symbolic_assert__`. Hand z3 the conjunction
// of the path conditions taken to reach here together with `cond`, and ask
// whether that is *satisfiable* (a witness input exists) rather than whether
// `cond` is necessarily true. `expected` is the bench's ground truth for THIS
// query (true = should be SAT). Prints the same `@@DJX_VERDICT` marker the runner
// reads, over the sat/unsat vocabulary.
function __IS_SAT__(cond: unknown, expected: unknown): void {
  D$.analysis.isSat(cond, expected);
}

// The ExpoSE `S$` corpus seams (analyses/concolic/expose/S$). `S$.symbol(name,
// seed)` and `S$.pureSymbol(name)` route here; unlike `__symbolic__` (the
// microbench seam) these per-run *unique* the name first, so two `S$.symbol("X",
// …)` calls become distinct SMT variables — ExpoSE's AssertToolkit.rename.
function __s_symbol__(name: unknown, seed: unknown): unknown {
  return D$.analysis.symbolNamed(name, seed);
}

// Typeless symbol (no seed); forks across types via pureSymbolNamed (M8).
function __s_pure__(name: unknown): unknown {
  return D$.analysis.pureSymbolNamed(name);
}

// Installs the symbolic ghost seams and returns them as the set of transparent
// callees: they run analysis code over lifted values, so they must NOT be
// stripped at the opaque boundary like a real native would be.
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
