// @type concolic
// @oracle false
// @target es5 string-touppercase
// @feature builtin toUpperCase-unmodeled
// Mirrors ExpoSE unmodeled/bug20: under the path condition x.toUpperCase() === "ABC"
// the input is NOT pinned ("abc","Abc","aBc","ABC",... all qualify), so the assert
// "x === 'abc'" is VIOLABLE -> the correct verdict is clean.

var x = __symbolic__("x", "abc");
if (x.toUpperCase() === "ABC") {
  __symbolic_assert__(x === "abc");
}
