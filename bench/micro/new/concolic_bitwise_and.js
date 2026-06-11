// @type concolic
// @oracle true
// @target es5 bitwise
// @feature syntax bitwise-and
// Mirrors ExpoSE else/bug12: under the path condition (x & 1) === 1 (x is odd), the
// assert "x !== 2" is necessarily valid (2 is even) -> detected.

var x = __symbolic__("x", 3);
if ((x & 1) === 1) {
  __symbolic_assert__(x !== 2);
}
