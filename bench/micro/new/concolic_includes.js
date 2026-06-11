// @type concolic
// @oracle true
// @target es6+ string-includes
// @feature builtin includes-unmodeled
// Mirrors ExpoSE string-model-bugs bug 7 (unsound includes negation): includes("a")
// and indexOf("a") >= 0 are equivalent, so under indexOf("a") >= 0 the assert
// "s.includes('a')" is necessarily valid -> detected.

var s = __symbolic__("s", "abc");
if (s.indexOf("a") >= 0) {
  __symbolic_assert__(s.includes("a"));
}
