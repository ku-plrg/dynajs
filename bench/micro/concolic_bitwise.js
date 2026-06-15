// @type concolic
// @target es5 bitwise
// @feature syntax bitwise
// 32-bit bitwise ops (ExpoSE else/bug10-12): `&`, `<<` (two's-complement wrap),
// `>>>` (ToUint32). Each case uses its own symbol so the accumulated path
// conditions stay independent.

// under (x & 1) === 1 (x is odd), "x !== 2" is valid (2 is even) -> detected.
var ba_x = __symbolic__("ba_x", 3);
if ((ba_x & 1) === 1) {
  __symbolic_assert__(ba_x !== 2, true);
}

// `<<` wraps: (1 << 31) === -2147483648. Under (x << 31) < 0, "x <= 0" is VIOLABLE
// (x = 1 also satisfies the guard) -> clean.
var ls_x = __symbolic__("ls_x", 1);
if (ls_x << 31 < 0) {
  __symbolic_assert__(ls_x <= 0, false);
}

// `>>>` does ToUint32: (-1 >>> 0) === 4294967295. Under (x >>> 0) > 2e9, "x >= 0"
// is VIOLABLE (x = -1 also satisfies the guard) -> clean.
var rs_x = __symbolic__("rs_x", -1);
if (rs_x >>> 0 > 2000000000) {
  __symbolic_assert__(rs_x >= 0, false);
}
