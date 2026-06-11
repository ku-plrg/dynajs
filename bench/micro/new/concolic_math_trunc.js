// @type concolic
// @oracle true
// @target es6+ math-trunc
// @feature builtin Math.trunc-unmodeled
// Mirrors ExpoSE math/bug30: under Math.trunc(x) === 3 the input lies in [3,4), so
// the assert "x >= 3" is necessarily valid -> detected.

var x = __symbolic__("x", 3.5);
if (Math.trunc(x) === 3) {
  __symbolic_assert__(x >= 3);
}
