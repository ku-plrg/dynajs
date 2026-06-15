// @type concolic
// @target es5 regex-test
// @feature builtin regex-global-anchor
// Mirrors ExpoSE regex/bug35: a global regex /a/g matches anywhere, so /a/g.test(x)
// does NOT imply the match is at index 0. The assert "x.charAt(0) === 'a'" is
// therefore VIOLABLE (x="ba" matches yet starts with 'b') -> the correct verdict is
// clean. ExpoSE's buggy "^"-anchor insertion proves it valid (a false positive).

var x = __symbolic__("x", "ba");
if (/a/g.test(x)) {
  __symbolic_assert__(x.charAt(0) === "a", false);
}
