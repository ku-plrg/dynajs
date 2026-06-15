// @type concolic
// @oracle true
// @target es6+ string-padstart
// @feature builtin padStart-unmodeled
// Mirrors ExpoSE unmodeled/bug25, oriented so the concretization is VISIBLE:
// the unmodeled call sits in the GUARD and the assert states one of the guard's
// consequences about the still-symbolic x. x.padStart(5,"0") === "00abc" means
// x is one of "abc"/"0abc"/"00abc" (the padded suffixes), so x.length >= 3 is
// valid -> detected. An engine that concretizes padStart records no guard
// constraint, so the assert is refuted with an empty PC (x = "") -> clean. The
// old neg-oracle shape (assert x === "abc") scored that same evaporation as a
// correct TN by accident.

var x = __symbolic__("x", "abc");
if (x.padStart(5, "0") === "00abc") {
  __symbolic_assert__(x.length >= 3);
}
