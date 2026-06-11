// @type concolic
// @oracle false
// @target es5 arithmetic
// @feature syntax modulo-sign
// Mirrors ExpoSE else/bug09: JS `%` is a remainder whose sign follows the dividend,
// so x % 3 can be negative (x=-2 -> -2). The assert "x % 3 >= 0" is therefore
// VIOLABLE -> the correct verdict is clean. A Euclidean-modulo model proves it valid.

var x = __symbolic__("x", -2);
__symbolic_assert__(x % 3 >= 0);
