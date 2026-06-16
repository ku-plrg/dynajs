// @type concolic
// @target es5 object-field
// @feature builtin symbolic-object-field
// A symbolic object mints a fresh symbol per field on first read and caches it,
// so repeated reads of the same field denote the same value (ExpoSE
// SymbolicObject). Under o.age > 18 the field is symbolic: o.age > 100 is NOT
// implied -> clean, while o.age > 0 is -> detected. A concrete-only engine
// reports o.age (== 25) > 100 as clean and > 0 as detected by coincidence; the
// first case is discriminating because the guard, not the seed, is what holds.

var o = __symbolic__("o", { age: 25 });
if (o.age > 18) {
  __symbolic_assert__(o.age > 100, false);
}

var o2 = __symbolic__("o2", { age: 25 });
if (o2.age > 18) {
  __symbolic_assert__(o2.age > 0, true);
}
