// @type concolic
// @oracle true
// @target es5 string-substring
// @feature builtin substring-implies
// The String.prototype.substring builtin flows as str.substr(s, 0, 2). The path
// condition p === "he" forces s to have at least two characters, so the assert
// s.length >= 2 is valid.

var s = __symbolic__("s", "hello");
var p = s.substring(0, 2);
if (p === "he") {
  __symbolic_assert__(s.length >= 2);
}
