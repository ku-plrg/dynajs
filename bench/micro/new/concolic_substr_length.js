// @type concolic
// @target es5 string-substr
// @feature builtin substr-length-implies
// Positive reference for the substr length semantics ExpoSE conflates with
// substring (bug 1a). substr's 2nd arg IS a length: "hello".substr(1,2) === "el"
// is the window s[1..3). Under p === "el", s.length >= 3 is necessarily valid.

var s = __symbolic__("s", "hello");
var p = s.substr(1, 2); // "el", window s[1..3)
if (p === "el") {
  __symbolic_assert__(s.length >= 3, true);
}
