// @type concolic
// @target es6+ array-includes
// @feature builtin symbolic-array-includes
// Array.prototype.includes on a symbolic array maps to z3 seq.contains. Under
// c.includes(8) the array contains an element, so it is non-empty and
// c.length >= 1 is valid -> detected. (ExpoSE models includes with an
// existential quantifier; the Sequence theory gives it directly.)

var c = __symbolic__("c", [7, 8, 9]);
if (c.includes(8)) {
  __symbolic_assert__(c.length >= 1, true);
}
