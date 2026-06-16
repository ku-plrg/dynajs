// @type concolic
// @target es5 array-indexof
// @feature builtin symbolic-array-indexof
// Array.prototype.indexOf on a symbolic array maps to z3 seq.indexof, whose
// result is -1 or a valid index < length. Under d.indexOf(30) === 2 that pins
// 2 < d.length, so d.length >= 3 is valid -> detected. (ExpoSE models indexOf
// with a quantified "no prior match"; the Sequence theory gives the index
// relation directly.)

var d = __symbolic__("d", [10, 20, 30]);
if (d.indexOf(30) === 2) {
  __symbolic_assert__(d.length >= 3, true);
}
