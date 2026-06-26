// Repro: `String.prototype.replaceAll(/regex/g, ...)` crashes under `--preset taint`.
//
// Run (must live under the instrumentation root, i.e. inside the repo, or the
// file silently runs as plain Node and the bug is hidden):
//
//   ./djx run --preset taint -- node repro.js
//
//   plain node    => "a@b@c"
//   --preset taint => TypeError: list.includes is not a function
//                     (thrown from `$.contains` in analyses/dist/Taint.mjs)
//
// Root cause
// ----------
// INTRINSICS_String_prototype_replaceAll, when searchValue is a RegExp, first
// asserts the regex carries the global flag
// (analyses/flow/spec/INTRINSICS.String.prototype.replaceAll.ts):
//
//     var flags = AO__Get($, searchValue, "flags");
//     if (!$.contains(AO__ToString($, flags), $.default("g", [])))
//         throw new TypeError;
//
// `$.contains` is defined in flow.ts as `(list, x) => list.includes(x)`, but
// `AO__ToString($, flags)` returns a *lifted* string. A lifted primitive is an
// inert proxy object (`{}`) — see flow.ts `lift()` — so `list.includes` is
// `undefined`, hence "is not a function".
//
// This is the same family as the String.prototype.replace `[object Object]`
// bug (a lifted primitive reaching a site that wants the raw value), but a
// different seam: here `$.contains` consumes a lifted arg without unlifting it,
// rather than a native callee coercing one. `$.contains` should `$.value(...)`
// its list (and member), or the generated model should hand it the raw string.
//
// Notes on what does NOT trigger it:
//   - a string searchValue ("a.b.c".replaceAll(".", "@")) never enters the
//     regex-flags branch, so it is unaffected;
//   - String.prototype.replace(/re/, ...) has no global-flag assertion, so it
//     never calls `$.contains`.

console.log("a.b.c".replaceAll(/\./g, "@"));
