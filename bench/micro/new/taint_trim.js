// @type taint
// @target es5 String.prototype.trim
// @feature builtin trim
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B1: trim() must strip real
// whitespace. Here the two leading spaces are clean and the "abcd" is tainted;
// "  abcd".trim() === "abcd" is exactly the tainted core. A model that encodes the
// space to a non-whitespace private-use code point makes trim a no-op, shifting
// the taint map so the first char of the real result reads clean. We probe it; the
// correct answer is tainted.

var x = "abcd";
__set_taint__(x);
var s = "  " + x; // 2 clean spaces + tainted "abcd"
var y = s.trim(); // "abcd"

__assert_taint__(y[0], true); // 'a', derived from the tainted core
