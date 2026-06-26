// Repro: `Array.prototype.sort(comparator)` returns the wrong order under
// `--preset taint` (no crash — the output multiset is intact, only the order
// is wrong).
//
// Run (must live under the instrumentation root, i.e. inside the repo, or the
// file silently runs as plain Node and the bug is hidden):
//
//   ./djx run --preset taint -- node repro2.js
//
//   plain node     => sorted: Abama,acerae,titillation,zucchetto
//   --preset taint => sorted: titillation,Abama,acerae,zucchetto   (input order — no sort)
//
// Note the individual comparisons are already correct under taint:
//   "Abama" < "titillation"  => true   (raw boolean, as expected)
// so the bug is not in `<`; it is in how the comparator's *return value*
// crosses back into native `sort`.
//
// Root cause
// ----------
// `Array.prototype.sort` is NOT modeled (it is absent from Model.BUILTINS in
// analyses/flow/model.ts), so it runs opaquely: the native `sort` calls the
// instrumented comparator directly. The comparator's `-1 / 0 / 1` are lifted
// primitives — inert proxy objects (`{}`, see flow.ts `lift()`). Native `sort`
// applies ToNumber to the comparator's result; `Number(<proxy>)` is `NaN`, so
// every comparison reads as "equal" and the array is left in input order.
//
// This is the callback-return-to-native seam, the mirror image of the
// argument seam: BoundaryEscape strips lifted primitives out of values flowing
// INTO an opaque call (and the `$.apply` fix unlifts args for non-modeled
// native callees), but nothing unlifts the value a user callback RETURNS when
// native code is the one invoking it and then coerces that return.
//
// Why other higher-order Array methods are fine: map / filter / find / reduce /
// some ARE modeled, so their callbacks run in the lifted domain via `$.apply`
// and their (lifted) return value is consumed by the model, never coerced by
// native. `sort` is the one whose return native consumes but which has no model.
//
// Fix directions (not done here):
//   (a) model `Array.prototype.sort` like the other higher-order Array methods
//       (run the comparator through `$.apply`, keep its result lifted), or
//   (b) at the opaque boundary, wrap instrumented function arguments so a
//       value they RETURN is unlifted before native coerces it — careful not to
//       regress cases where native stores the return for later instrumented
//       reads (there, unlifting would drop info).

const items = [
  { tag: 'titillation' },
  { tag: 'Abama' },
  { tag: 'acerae' },
  { tag: 'zucchetto' },
];

items.sort((a, b) => {
  if (a.tag < b.tag) return -1;
  if (a.tag === b.tag) return 0;
  return 1;
});

console.log('"Abama" < "titillation":', 'Abama' < 'titillation');
console.log('sorted:', items.map((x) => x.tag).join(','));
