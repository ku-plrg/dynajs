# `partial-check` — a static verifier (and generator) for `--partial`

## 1. The problem this exists to solve

dynajs supports **adaptive / partial instrumentation** (`--partial`): instead of
weaving a runtime hook around every JS operation, the instrumenter inspects
which callbacks the loaded analysis actually implements and only emits the hooks
those callbacks need. Everything else is transpiled back to plain code.

The heart of this is `src/partial.ts`'s `PartialChecker`: a set of getters
(`G`, `F`, `B`, `Aw`, …) that map *analysis callbacks* (`getField`, `invokeFun`,
`binary`, …) to *which instrumentation hooks must be emitted*. For example:

```ts
get G() {
  return this.callbackHint.getFieldPre
      || this.callbackHint.getField
      || this.callbackHint.memoryAccess;
}
```

This mapping is **hand-maintained and silently load-bearing**. If it is wrong —
if some callback needs a hook the getter doesn't turn on — then in partial mode
that hook is not emitted and the callback *silently never fires* (or a shared
runtime invariant desyncs). These failures are invisible to the normal test
suite, because the real analyses (`FlowAnalysis` subclasses: taint, concolic)
implement essentially *all* callbacks, so partial degenerates to full. The bugs
only bite **sparse** analyses — exactly the use case partial exists for.

`partial-check` verifies this mapping statically against the actual runtime and
instrumenter, and can **generate** the mapping (the checker and the generator
are two directions of the same analysis).

## 2. How to run

```
npm run check:partial        # SYNC + P1 coverage + P2 state invariants
npm run check:partial:test   # unit tests for the BDD domain (node:test)
npm run check:partial:gen    # derive PartialChecker getters, diff vs current
npm run check:partial:emit   # emit a full regenerated src/instrument/partial.ts
```

`check:partial:emit` prints to stdout (a proposal; it does not overwrite the
file). Redirect with `node` directly (not `npm run`, whose banner pollutes
stdout): `node ./tools/partial-check/run.mjs --emit > /tmp/partial.gen.ts`.

All three go through `run.mjs`, which bundles the (TypeScript) tool with esbuild
(it depends on the `typescript` compiler API) and runs it against the repo root.
The tool is intentionally **out-of-band from `tsc`**: it is a build-time
meta-tool, not part of the shipped build.

## 3. Theoretical framing

The instrumenter is a **2-level / staged program** (metaprogramming): the
`state.partial.*` flags are **stage-0 (compile-time) static inputs**, and the
emitted `D$.X(...)` calls are **stage-1 generated code**. The central question —
"under what static condition (i.e. which set of implemented callbacks `S`) is
hook `H` emitted?" — is therefore a **reachability problem in a predicate-
abstraction domain** over the `state.partial.*` atoms.

A crucial property makes this clean and *exact* rather than merely sound: the
`state.partial.*` atoms are **immutable within a run** (derived once from `S`,
never reassigned). So the predicates never change truth mid-execution, and the
abstraction introduces no spurious behaviour of its own.

Every layer of the tool is a standard program-analysis construct:

| Concern | Standard concept | Where |
| --- | --- | --- |
| gate domain | **predicate abstraction** — free Boolean algebra over partial-atoms, as a **BDD** | `domain/` |
| intra reach-condition | **forward MFP** (Kildall); transfer `λx. x∧g` is distributive ⇒ **MFP = MOP** (exact) | `solve/intra.ts` |
| interprocedural | **Sharir–Pnueli functional/summary** approach; context fixpoint over the call graph | `solve/inter.ts` |
| alias / `const` resolution | **use-def via checker symbols** (SSA-trivial for `const`) | `ast.ts` `constInit` |
| dynamic `D$.analysis[cb]` | **constant propagation** as a powerset over-approx (sound) | `extract/invokes.ts` |
| P1 coverage | evaluate the gate BDD at the **callback singleton** `S={c}` | `check/coverage.ts` |
| P2 state safety | **typestate** over shared-state slots; protocol declared in-code | `check/state.ts` |
| generation | the **dual** of the checker (invert coverage/state closures) | `generate/` |

**Why singletons suffice for P1.** Partial-vs-full equivalence is required for
every callback-set `S`. Both `emitted(S)` (getters are disjunctions) and the true
requirement distribute over `∪`, so `∀S. emitted(S) ⊇ need(S)` iff it holds on
every singleton `{c}`. The checker therefore only evaluates `gate(H).eval(S={c})`
for each callback `c` (~90 checks), no path/`S` enumeration.

## 4. Architecture (module by module)

```
domain/
  bdd.ts        hash-consed ROBDD (ite-based). Canonical ⇒ structural equality
                is identity equality, so eval/leq/fixpoint-convergence are O(1).
                API: atom, and/or/not, implies (entailment), eval, support, dnf.
  lattice.ts    Lattice<T> interface + BoolDomain over Bdd:
                ⊥=FALSE, ⊤=TRUE, ⊔=∨ (reachable via any path), ⊓=∧, ⊑=entailment.
  domain.test.ts  node:test unit tests (canonicity, absorption/distributivity/
                De Morgan, lattice order, coverage-style eval).

program.ts      load(root): ts.createProgram from tsconfig (NOT createSourceFile —
                the binder must run so the TypeChecker's symbol table exists).
ast.ts          walk, unwrap, partialGetter (state.partial.<g>), isNot,
                constInit (scope-correct `const` alias resolution via the checker),
                readMeta / allMetaAttrs (@dynajs-meta doc parsing).
gate.ts         ALWAYS sentinel; constHookMap (constant.ts `hook('G')` ⇒ LOG.X→hook).

solve/
  intra.ts      guardBdd(expr, want): BDD of the state.partial.* formula of a
                condition (alias-resolved). analyzeFn: structured forward MFP over
                a function body — threads a reach-condition (⊓ guard / ⊓ ¬guard at
                branches, ⊔ at merges, ⊥ after return/throw; inline arrow thunks
                are inlined at their definition site). Returns FnFacts = the
                reach-condition of every emit site and call site.
  inter.ts      interGate: builds the emitter call graph (edges = calls resolving
                via checker symbol to a write.ts/visitor.ts function; state.walk
                framework dispatch is deliberately NOT an edge — it re-enters
                visitor handlers at ⊤). Computes ctx(F) (the condition under which
                F is invoked) as a monotone BDD-lattice fixpoint; roots = ⊤.
                gate(hook) = ⋁ over emit sites of ctx(F) ∧ intra-reach.

extract/
  getters.ts    loadGetters: the callback universe (callbackHintFull keys) and
                req(getter) (callbacks each PartialChecker getter ORs).
  invokes.ts    loadInvokes: for each runtime hook, which callbacks it fires and
                through which immediate provenance — 'self' (D$.analysis.X directly
                or via a transparent helper), a child-hook name (a re-walk recovery
                boundary), or 'C'/'B' (an op-scoped condition/binary call). This is
                a def-use / call-graph reachability on hooks.ts + runtime.ts,
                op-aware for the dynamically-dispatched condition/binary specifics.

check/
  coverage.ts   P1. A callback c is missed via (hook H, provenance p) iff H is not
                emitted at S={c} AND H's fallback doesn't recover p. Emission is
                decided by gate(H).eval with getter g on ⟺ c∈req(g). FALLBACK
                recovery table: {M,Mp,TM,TMp → G,Gp} (they re-walk the callee/tag,
                a member get).
  state.ts      P2. Parses @dynajs-meta state protocols (closed vocab), extracts
                state def-use (returnStack/switchStack + rt.<field> +
                pushSwitchLeft/popSwitchLeft ⇒ save/restore), and runs the
                per-protocol typestate invariant on the BDD gates.

generate/
  getters.ts    generateGetters: the dual of the checker. getter(g) = ⋃ over hooks
                gated by g of their necessary-carrier callbacks (self + op +
                non-recovered child). hook→getter is read from the lexical guards
                via guardBdd's support (alias-resolved).

main.ts         orchestrates SYNC + P1 + P2; exits non-zero on findings.
gen.ts          runs the generator and diffs vs the current src/partial.ts.
run.mjs         esbuild bundler/runner; selects main.ts / domain.test.ts / gen.ts.
```

## 5. What it checks

### SYNC (completeness)
Every hook exported from `runtime/hooks.ts` (the authoritative D$ hook surface,
assembled into `BASE` via `...hooks`) must have a derived gate — i.e. an emit
site in the instrumenter. A new hook with no gate is flagged.

### P1 — coverage (silent info-loss)
For every callback `c` and every hook that can fire `c`, `c` must still fire in
partial mode when only `c` is implemented. Failure = `c` silently misses events.

### P2 — shared-state invariants (breakage / staleness)
`runtime.ts` has module-level mutable state (`returnStack`, `switchStack`,
`rt.uncaughtException`, `rt.switchLeft`, `rt.lastComputedValue`). Each slot's
**protocol** is declared in-code with a `@dynajs-meta` doc comment; the checker
enforces the matching invariant on the BDD gates:

- `balanced-stack` — push-gate `==` pop-gate (else the stack can desync).
- `save-restore` — consumer-gate `⊑` save/restore-gate (else a nested scope
  clobbers the scalar).
- `set-drain` — writer-gate `⊑` reader-gate ∨ always-emitted-clearer.
- `scratch` — no cross-hook invariant.

The vocabulary is **closed**: an unknown `@dynajs-meta` attribute or protocol
value is an error, and an undeclared shared-state slot is an error — so a typo'd
or missing annotation surfaces instead of being silently ignored.

### Generation
`generate/` derives the getters from the same facts. Diffing the generated
getters against the current `src/partial.ts` is equivalent to the P1/P2 report,
expressed as concrete getter edits.

## 6. Findings on the current code

`npm run check:partial` currently reports **16 P1 + 1 P2**. Each has been
confirmed against ground-truth instrumented output (by instrumenting snippets
with a chosen `callbackHint` and inspecting which `D$.X` appear).

### P1
- **`x++` / `x--` don't fire `binary`/`arithmeticBinary`** for a binary-only
  analysis. `Up` is gated only by the `U` (unary) getter; its gate-false fallback
  is `generate(expr)` (verbatim), so the desugared `+`/`-` is lost. *(The
  `comparison*`/`bitwise*` rows are conservative: `Up` only ever uses `+`/`-`, so
  in reality only `arithmeticBinary` is affected.)*
- **`optionalChain` is uncoverable standalone.** It fires only via `C('?.')`
  called inside `G`/`Gp`/`M`/`Mp`/`F`/`De`/`Sm` (member/call/delete optional
  guards); no gate lists `optionalChain`, and there is no standalone emit for it.
  Confirmed: `obj?.prop` is verbatim under an `optionalChain`-only hint.
- **`condition` misses `?.` guards.** It fires for `if`/`while`/`&&`/… via the
  standalone `D$.C` hook (covered), but the `?.`-guard conditions fire only via
  the same `C('?.')` internal calls (not covered) — a partial divergence.
- **`superMethodCall`/`superMethodCallPre` (via `Sm`) and `superCall`/
  `superCallPre` (via `Su`) need `invokeFun` co-implemented.** The precise
  interprocedural gate is `F ∧ Sm` / `F ∧ Su`, because `super.m()` / `super()`
  are emitted inside `logCall`'s `if (!state.partial.F) return` early exit.
  Confirmed: `super.f(1)` is instrumented (`D$.Sm`) only when *both* `invokeFun`
  and `superMethodCall` are implemented; either alone leaves it verbatim.
- **`superGetField`/`superGetFieldPre` (via `Sm→Gs`)** — the implicit property
  read inside `super.m()` is lost unless the super-method path is emitted.

### P2
- **`switchLeft` nested-scope clobber**, condition `¬Fe ∧ (B∨C)`. `switchLeft`
  is written/read by `Swl`/`Swr` (gated by `B∨C` — i.e. any binary/condition
  callback, including `switchCondition`), but only save/restored via
  `pushSwitchLeft`/`popSwitchLeft` inside `Fe`/`Fx` (gated by `Fe` =
  functionEnter/Exit). So an analysis that instruments switches without function
  callbacks drops the save/restore, and a switch reached during another switch's
  case-test evaluation (through a function call) clobbers the outer `switchLeft`
  → wrong branch taken. Confirmed at the instrumentation level: under a
  `switchCondition`-only hint the function body has no `D$.Fe`/`D$.Fx` while the
  switches still get `D$.Swl`/`D$.Swr`; the runtime clobber follows deterministically.
- `returnStack` / `switchStack` are **balanced** ✓; `uncaughtException` is
  **drained** ✓ (`Ce` clears it unconditionally on catch-enter).

**These are candidate divergences, not automatically bugs.** Whether each is a
bug to fix or an accepted non-goal is a semantics decision (see §8).

## 7. What the generator does today

The generator (dual of the checker) derives each getter from the same facts.
`check:partial:gen` reports the derivation vs the current file; `check:partial:emit`
emits a full regenerated `src/instrument/partial.ts`.

Getter shapes are handled per the refactored file: **primary** getters get a
generated disjunction; **delegating** (`return this.F`) and **always-on**
(`return true`) getters and the `shouldWrapThrow` structural gate are preserved
verbatim (the emitter splices only primary return-expressions into the current
source, so imports/types/comments/data are untouched). A primary's callback set =
the coverage closure (necessary carriers) ∪ the current getter's terms, so
coverage-fixable findings appear as *added* callbacks and non-derivable
state-closure terms (e.g. `Aw`/`Y`'s frame deps) are preserved.

**Round-trip proof (empirical):** swapping the emitted file in and re-running the
checker gives **0 P1** findings (down from 16), leaving only the P2 `switchLeft`
finding (which needs a state-closure getter — see §8). So the generated file is
*coverage-correct by construction*.

Notably `super*` is fixed **without** an instrumenter change: the emit sits under
both `logCall`'s `if(!F)` and the `Sm` guard, so `hookGetters(Sm) = {F, Sm}` and
the generator adds `super*` to **both** `getter(F)` and `getter(Sm)`; then
`superMethodCall` alone turns on both, satisfying the `F ∧ Sm` gate.

## 8. Limitations & what is not done yet

### Generator: what's left
- The emitter produces a full file and round-trips to **0 P1** (§7). What it does
  NOT yet derive is the **state closure** — the getter terms that come from P2
  obligations rather than coverage: `getter(Fe) ⊇ (B∨C)` (from `switchLeft`
  `save-restore`, the one remaining finding), `shouldWrapThrow` (from
  `uncaughtException` `set-drain`), and the `Aw`/`Y` frame deps. The emitter
  currently PRESERVES these from the existing file (union), so behaviour is kept,
  but it cannot yet regenerate them from scratch.
- Formatting is minimal; run `prettier` on the emitted file.

### Adopting the generated file is a policy call
- The coverage fixes over-instrument: adding `optionalChain` to `getter(G/M/F/De)`
  (and `super*` to `getter(F)`) makes those callbacks coverable but means
  implementing `optionalChain` (or `superMethodCall`) alone now instruments
  *every* get/call. "0 P1 by over-instrumenting" vs "document as non-goal" is the
  user's decision — the emitter shows the maximally-sound version.
- (Historical note; now resolved) The `super*` findings were thought to also need
  an instrumenter change. It doesn't: the gate is `F ∧ Sm` because the super
  branch is nested inside `logCall`'s `if(!F)`, so `hookGetters(Sm) = {F, Sm}` and
  the generator adds `super*` to both `getter(F)` and `getter(Sm)` — turning on
  `superMethodCall` alone satisfies `F ∧ Sm`. No `logCall` restructure needed.

### Remaining hand-maintained input
- The **FALLBACK recovery table** (`{M,Mp,TM,TMp → G,Gp}`) in `check/coverage.ts`
  is hand-coded. The walk-vs-verbatim *kind* is auto-derivable (does the
  gate-false branch call `state.walk` or `generate`?); *which child hook* a walk
  re-instruments into is semantic (a walked member becomes `G`/`Gp`). This is the
  last small hand table.

### Known imprecisions (all sound for the checks we run)
- **`state.walk` = ⊤.** Framework dispatch is not a call-graph edge, so an emit
  reached via a re-walk is analysed at ⊤ context (loses the suppressing hook's
  `¬X`). This over-approximates gates, but is sound for the *singleton* coverage
  query (under `S={c}`, the dropped `¬X` holds whenever `c ≠ X`'s callback), so it
  cannot produce a false negative.
- **Unconditional-emit paths ⇒ ⊤ gates.** `writeModuleWrappedExpression`
  (module-top `export default expr` / module var-init) always wraps in
  try/catch + `logException`, and compound/logical assignment always routes
  through `D$.B`/`D$.C` for value computation, and computed class fields always
  emit `Fi`. So `gate(X/B/C/Aw/Awr/Lcs/Fi) = ⊤`. This is *correct* (confirmed:
  an empty hint still emits `D$.X` and `D$.B`), just coarser than the intent-only
  hand table. The generator's lexical hook→getter extraction skips these
  (they aren't getter-gated).
- **Conservative over-approx** in a few spots: `Up`'s binary specifics include
  `comparison*`/`bitwise*` though `Up` only uses `+`/`-`; `Swr` (gated `B∨C`)
  attributes both `condition` and `binary` to *both* the `C` and `B` getters.
- **Dynamic `D$.analysis[cb]`** constant-propagation is a flow-insensitive
  powerset (e.g. the `C` hook is treated as firing all `CONDITION_CB` values).
  Sound; slightly imprecise. Harmless for the current findings.
- **`set-drain` check is coarse**: it does not distinguish "set" from "clear"
  writes and leans on `Ce` being always-emitted. Full rigor would need a
  definedness/must-initialized abstract interpretation (the deferred "Tier 2").

### Integration gaps
- **Not wired into `npm test`.** Real findings currently exist, so a
  fail-on-finding gate is premature; it needs either a snapshot of expected
  findings or the findings triaged/fixed first.
- **The tool itself is not type-checked** by `tsc` (it is bundled and run by
  esbuild, which strips types without checking). Adding a `tsconfig` for `tools/`
  would catch tool-level type errors.
- **Convention-coupled extraction.** The tool relies on the current code shape:
  `LOG.<CONST>` emit sites, `hook('X')` in `constant.ts`, `state.partial.<g>`
  guards, `D$.analysis.X` calls, `pushSwitchLeft`/`popSwitchLeft`,
  `rt.<field>` state. If these conventions change, the extractors need updating
  (the SYNC check catches new *hooks*, but not renamed *conventions*).

## 9. Suggested next steps

1. **State closure in the generator**: derive `getter(Fe) ⊇ (B∨C)` (from the
   `switchLeft` `save-restore` obligation) so `check:partial:emit` round-trips to
   **0 P1 + 0 P2**, not just 0 P1. Same machinery gives `shouldWrapThrow`.
2. **Triage / adopt**: decide whether to adopt the emitted (maximally-sound,
   over-instrumenting) getters or document `optionalChain`/`super*`-only as
   non-goals.
3. **Auto-derive FALLBACK** (walk-vs-verbatim from the gate-false branch),
   removing the last hand table.
4. **Wire into `npm test`** behind a findings snapshot; add a `tools/tsconfig`.
5. (Optional, "Tier 2") a definedness abstract interpretation to discharge the
   `set-drain`/state invariants rigorously rather than via the coarse check.
