// @type concolic
// @oracle true
// @target es5 string-substring
// @feature builtin substring-length-vs-end
// Mirrors ExpoSE string-model-bugs bug 1a/1c: substring's 2nd arg is an END index,
// but the model treats it as a LENGTH. "hello".substring(1,3) === "el". Under the
// path condition p === "el" the window s[1..3) must hold both chars, so
// s.length >= 3 is necessarily valid. ExpoSE's substr-length model takes a 3-wide
// window and answers wrongly.

var s = __symbolic__("s", "hello");
var p = s.substring(1, 3); // "el", window s[1..3)
if (p === "el") {
  __symbolic_assert__(s.length >= 3);
}
