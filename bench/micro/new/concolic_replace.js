// @type concolic
// @target es5 string-replace
// @feature builtin replace-unmodeled
// Mirrors ExpoSE unmodeled/bug22: under x.replace("a","X") === "Xbc" the input is
// NOT pinned ("abc" and the no-op "Xbc" both qualify), so the assert "x === 'abc'"
// is VIOLABLE -> the correct verdict is clean.

var x = __symbolic__("x", "abc");
if (x.replace("a", "X") === "Xbc") {
  __symbolic_assert__(x === "abc", false);
}
