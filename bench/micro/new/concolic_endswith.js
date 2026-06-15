// @type concolic
// @target es6+ string-endswith
// @feature builtin endsWith-unmodeled
// Mirrors ExpoSE unmodeled/bug24: under x.endsWith("bar") the string has at least
// 3 chars, so the assert "x.length >= 3" is necessarily valid -> detected.

var x = __symbolic__("x", "foobar");
if (x.endsWith("bar")) {
  __symbolic_assert__(x.length >= 3, true);
}
