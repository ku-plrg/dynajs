// @type concolic
// @oracle true
// @target es6+ string-at
// @feature builtin at-negative-index
// Mirrors ExpoSE unmodeled/bug27: under x.at(-1) === "z" the string is non-empty,
// so the assert "x.length >= 1" is necessarily valid -> detected. (Negative index
// also exercises a case charAt's model does not cover.)

var x = __symbolic__("x", "abz");
if (x.at(-1) === "z") {
  __symbolic_assert__(x.length >= 1);
}
