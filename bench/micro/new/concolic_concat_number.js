// @type concolic
// @oracle true
// @target es5 string-concat
// @feature syntax concat-number-coercion
// Mirrors ExpoSE string-model-bugs bug 8: `s + 1` coerces 1 to "1", so t = str.++(s,
// "1"); under t === "ab1" the symbol s is pinned to "ab" -> s === "ab" is valid.

var s = __symbolic__("s", "ab");
var t = s + 1; // "ab1"
if (t === "ab1") {
  __symbolic_assert__(s === "ab");
}
