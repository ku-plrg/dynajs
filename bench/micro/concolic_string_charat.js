// @type concolic
// @target es5 string-index
// @feature syntax characcess-implies
// `s[0]` is the fixed-window char access str.substr(s, 0, 1). Under the path
// condition s[0] === "h", the disequality s[0] !== "x" is necessarily true.

var s = __symbolic__("s", "hat");
if (s[0] === "h") {
  __symbolic_assert__(s[0] !== "x", true);
}
