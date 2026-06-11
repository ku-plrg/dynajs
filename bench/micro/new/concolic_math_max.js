// @type concolic
// @oracle true
// @target es5 math-max
// @feature builtin Math.max-unmodeled
// Mirrors ExpoSE math/bug31: under Math.max(x, 5) === 7 the input must be 7 (if
// x <= 5 the max is 5), so the assert "x === 7" is necessarily valid -> detected.

var x = __symbolic__("x", 7);
if (Math.max(x, 5) === 7) {
  __symbolic_assert__(x === 7);
}
