// @type taint
// @oracle true
// @target es5 String.prototype.substring
// @feature builtin substring-swap
// Mirrors NodeMedic-FINE string_model_bugs.ts BUG A2: substring swaps its args
// when start > end. "0123456789".substring(6,2) === "2345" (JS swaps to (2,6)),
// all four chars coming from the tainted base. A model that runs Array.slice(6,2)
// yields "" and drops every tainted byte. We probe the first char of the real
// result; the correct answer is tainted.

var x = "0123456789";
__set_taint__(x);
var y = x.substring(6, 2); // "2345"

__print_if_tainted__(y[0]); // '2', derived from the tainted base
