// @type concolic
// @target es5 string-indexof
// @feature builtin indexOf-negative-from
// Mirrors ExpoSE coercion/bug33: JS clamps a negative fromIndex to 0, so
// charAt(0) === "a" implies x.indexOf("a", -5) === 0. The buggy expression
// lives in the ASSERT, not the guard: ExpoSE's model passes -5 straight to
// Z3's seq.indexof, which yields -1 for a negative offset, so under a clean,
// well-modeled PC (charAt) the assert reads -1 === 0 -> refutable -> clean.
// (Guarding on indexOf(-5) instead would poison the PC itself: an
// inconsistent PC proves anything, masking the bug as `detected`.)

var x = __symbolic__("x", "abc");
if (x.charAt(0) === "a") {
  __symbolic_assert__(x.indexOf("a", -5) === 0, true);
}
