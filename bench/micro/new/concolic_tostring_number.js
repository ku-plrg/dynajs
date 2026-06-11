// @type concolic
// @oracle true
// @target es5 string-concat
// @feature syntax tostring-number-coercion
// Mirrors ExpoSE coercion/bug32: coercing a symbolic NUMBER to a string via
// concatenation. ("" + x) === "42" pins x to 42, so x === 42 is provably valid.

var x = __symbolic__("x", 42);
var s = "" + x; // number -> string coercion
if (s === "42") {
  __symbolic_assert__(x === 42);
}
