// @type concolic
// @oracle false
// @target es5 bitwise
// @feature syntax unsigned-rshift
// Mirrors ExpoSE else/bug10: `>>>` does ToUint32 so (-1 >>> 0) === 4294967295. Under
// the path condition (x >>> 0) > 2e9, the assert "x >= 0" is VIOLABLE (x = -1 also
// satisfies the guard) -> the correct verdict is clean.

var x = __symbolic__("x", -1);
if (x >>> 0 > 2000000000) {
  __symbolic_assert__(x >= 0);
}
