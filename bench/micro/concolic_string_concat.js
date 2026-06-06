// @type concolic
// @oracle true
// @target es5 string-concat
// @feature syntax concat-implies
// `+` with a string operand is concatenation: t = str.++(s, "!"). The path
// condition t === "ab!" pins s to exactly "ab", so `s === "ab"` is valid.

var s = __symbolic__("s", "ab");
var t = s + "!";
if (t === "ab!") {
  __symbolic_assert__(s === "ab");
}
