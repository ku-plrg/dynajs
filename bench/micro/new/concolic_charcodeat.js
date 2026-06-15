// @type concolic
// @target es5 string-charcodeat
// @feature builtin charCodeAt-unmodeled
// Mirrors ExpoSE unmodeled/bug26: under x.charCodeAt(0) === 90 the string is
// non-empty, so the assert "x.length >= 1" is necessarily valid -> detected.

var x = __symbolic__("x", "Z");
if (x.charCodeAt(0) === 90) {
  __symbolic_assert__(x.length >= 1, true);
}
