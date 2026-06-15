// @type concolic
// @target es6+ string-padstart
// @feature builtin padStart-unmodeled
// Mirrors ExpoSE unmodeled/bug25: under x.padStart(5,"0") === "00abc" the input is
// NOT pinned ("abc" pads to it, and the already-length-5 "00abc" is unchanged), so
// the assert "x === 'abc'" is VIOLABLE -> the correct verdict is clean.

var x = __symbolic__("x", "abc");
if (x.padStart(5, "0") === "00abc") {
  __symbolic_assert__(x === "abc", false);
}
