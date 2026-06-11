// @type concolic
// @oracle false
// @target es5 string-lastindexof
// @feature builtin lastIndexOf-unmodeled
// Mirrors ExpoSE string-model-bugs bug 2 (lastIndexOf modeled as indexOf): under the
// path condition s.indexOf("a") === 0 the assert "s.lastIndexOf('a') === 0" is
// VIOLABLE (s="aa" gives lastIndexOf 1) -> the correct verdict is clean.

var s = __symbolic__("s", "aa");
if (s.indexOf("a") === 0) {
  __symbolic_assert__(s.lastIndexOf("a") === 0);
}
