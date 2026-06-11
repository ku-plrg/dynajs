// @type concolic
// @oracle true
// @target es5 global-parseint
// @feature builtin parseInt-unmodeled
// Mirrors ExpoSE globals/bug34: under parseInt(x) === 42 the string starts with the
// digits "42", so the assert "x.length >= 2" is necessarily valid -> detected.

var x = __symbolic__("x", "42");
if (parseInt(x) === 42) {
  __symbolic_assert__(x.length >= 2);
}
