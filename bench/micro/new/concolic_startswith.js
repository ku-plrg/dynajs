// @type concolic
// @target es6+ string-startswith
// @feature builtin startsWith-unmodeled
// Mirrors ExpoSE unmodeled/bug23: under x.startsWith("foo") the string has at least
// 3 chars, so the assert "x.length >= 3" is necessarily valid -> detected.

var x = __symbolic__("x", "foobar");
if (x.startsWith("foo")) {
  __symbolic_assert__(x.length >= 3, true);
}
