// @type concolic
// @oracle true
// @target es5 arithmetic
// @feature syntax arithmetic-implies
// `y = x * 2` flows symbolically, so the branch y > 8 records the constraint
// 2*x > 8. Over the integers that entails x >= 5, so the assert is valid.

var x = __symbolic__("x", 6);
var y = x * 2;
if (y > 8) {
  __symbolic_assert__(x >= 5);
}
