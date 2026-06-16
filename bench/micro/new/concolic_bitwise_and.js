// @type concolic
// @target es5 bitwise
// @feature syntax bitwise-and
// Mirrors ExpoSE else/bug12: '&' is missing from _symbolicBinary's switch, so
// (x & 1) === 1 evaluates to a poisoned `undefined` and control falls into the
// WRONG branch. Both branches therefore carry a branch-appropriate valid
// assert: then (x odd) -> x !== 2; else ((x & 1) !== 1) -> x !== 3. A correct
// engine proves whichever branch the seed takes; the poisoned engine lands in
// else with an empty PC, where x !== 3 is refutable (x = 3) -> clean.

var x = __symbolic__("x", 3);
if ((x & 1) === 1) {
  __symbolic_assert__(x !== 2, true);
} else {
  __symbolic_assert__(x !== 3, true);
}
