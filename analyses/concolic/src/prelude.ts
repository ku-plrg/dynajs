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
// true under that path condition (i.e. `PC ∧ ¬cond` is UNSAT). Prints the
// `@@DJX_VERDICT detected|clean` marker the microbench runner reads.
function __symbolic_assert__(cond: unknown): void {
  D$.analysis.symbolicAssert(cond);
}

// Installs the symbolic ghost seams and returns them as the set of transparent
// callees: they run analysis code over wrapped values, so they must NOT be
// stripped at the opaque boundary like a real native would be.
export function installPrelude(): ReadonlySet<unknown> {
  const g = globalThis as Record<string, unknown>;
  g.__symbolic__ = __symbolic__;
  g.__symbolic_assert__ = __symbolic_assert__;
  return new Set<unknown>([__symbolic__, __symbolic_assert__]);
}
