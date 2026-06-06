// @type concolic
// @oracle true
// @target es5 string-length
// @feature syntax length-implies
// `s.length` flows symbolically as str.len(s). Under the path condition
// str.len(s) > 3 (over the integers) str.len(s) >= 4 is necessarily true, so the
// assert is valid.

var s = __symbolic__("s", "hello");
if (s.length > 3) {
  __symbolic_assert__(s.length >= 4);
}
