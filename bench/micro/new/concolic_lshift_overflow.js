// @type concolic
// @oracle false
// @target es5 bitwise
// @feature syntax lshift-overflow
// Mirrors ExpoSE else/bug11: JS `<<` wraps to 32-bit two's complement, so
// (1 << 31) === -2147483648. Under the path condition (x << 31) < 0, the assert
// "x <= 0" is VIOLABLE (x = 1 also satisfies the guard) -> the correct verdict is
// clean.

var x = __symbolic__("x", 1);
if (x << 31 < 0) {
  __symbolic_assert__(x <= 0);
}
