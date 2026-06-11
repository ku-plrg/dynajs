// @type taint
// @oracle true
// @target es5 String.prototype.substring
// @feature builtin substring-negative-clamp
// Mirrors NodeMedic-FINE string_model_bugs.ts BUG A3: substring clamps a negative
// index to 0. "abcde".substring(-3) === "abcde" (the whole, fully tainted string).
// A model that runs Array.slice(-3) keeps only "cde" and the first two chars lose
// their taint. We probe the first char; the correct answer is tainted.

var x = "abcde";
__set_taint__(x);
var y = x.substring(-3); // "abcde"

__print_if_tainted__(y[0]); // 'a', derived from the tainted base
