// @type concolic
// @oracle false
// @target es5 string-tolowercase
// @feature builtin toLowerCase-pruning
// Mirrors ExpoSE string-model-bugs bug 5 (toLowerCase prunes uppercase inputs):
// under x.toLowerCase() === "abc" the input is NOT pinned to lowercase ("Abc" also
// qualifies), so the assert "x.charAt(0) === 'a'" is VIOLABLE -> the correct verdict
// is clean. (toLowerCase taint is covered by taint_toLowerCase.js.)

var x = __symbolic__("x", "Abc");
if (x.toLowerCase() === "abc") {
  __symbolic_assert__(x.charAt(0) === "a");
}
