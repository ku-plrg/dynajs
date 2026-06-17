// @type concolic
// @target es5 string-index
// @feature syntax characcess-implies

var s = __symbolic__("s", "hat");
if (s[0] === "h") {
  __symbolic_assert__(s[0] !== "x", true);
} else {
  __symbolic_assert__(false, true);
}
