// @type concolic
// @oracle true
// @target es5 string-indexof
// @feature builtin indexOf-negative-from
// Mirrors ExpoSE coercion/bug33: a negative fromIndex clamps to 0, so
// "abc".indexOf("a", -5) === 0. Under that guard the assert "x.charAt(0) === 'a'" is
// necessarily valid -> detected. (Z3's seq.indexof returns -1 for a negative offset,
// which is the source of ExpoSE's divergence.)

var x = __symbolic__("x", "abc");
if (x.indexOf("a", -5) === 0) {
  __symbolic_assert__(x.charAt(0) === "a");
}
