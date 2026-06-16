// @type concolic
// @target es5 string-replace
// @feature builtin replace-unmodeled
// Mirrors ExpoSE unmodeled/bug22, oriented so the concretization is VISIBLE:
// the unmodeled call sits in the GUARD and the assert states one of the guard's
// consequences about the still-symbolic x. x.replace("a","X") === "Xbc" forces
// length 3 either way (a 1:1 char swap preserves length; with no "a" the result
// is x itself, i.e. x === "Xbc"), so x.length === 3 is valid -> detected. An
// engine that concretizes replace records no guard constraint, so the assert
// is refuted with an empty PC -> clean. The old neg-oracle shape (assert
// x === "abc") scored that same evaporation as a correct TN by accident.

var x = __symbolic__("x", "abc");
if (x.replace("a", "X") === "Xbc") {
  __symbolic_assert__(x.length === 3, true);
}
