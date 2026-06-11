// @type taint
// @oracle true
// @target es5 String.prototype.substr
// @feature builtin substr-length-arg
// Mirrors NodeMedic-FINE string_model_bugs.ts BUG A1: substr's 2nd arg is a
// LENGTH, not an end index. "0123456789".substr(2,3) === "234" (3 chars taken
// from the tainted base). A model that applies Array.slice(2,3) keeps only 1
// char, so the last char of the real result loses its taint. We probe that last
// char; the correct answer is that it is tainted.

var x = "0123456789";
__set_taint__(x);
var y = x.substr(2, 3); // "234"

__print_if_tainted__(y[2]); // '4', derived from the tainted base
