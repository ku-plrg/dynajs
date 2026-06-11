// @type taint
// @oracle true
// @target es5 Array.prototype.join
// @feature builtin join-null-element
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B8: Array.join renders null and
// undefined elements as the empty string. ["a",null].join("-") === "a-". A model
// that calls null.toString() on every element throws a TypeError and aborts the
// whole analysis on this extremely common pattern (a crash is scored as an error
// verdict). The tainted 'a' must survive; we probe it, and the correct answer is
// tainted.

var a = "a";
__set_taint__(a);
var arr = [a, null];
var y = arr.join("-"); // "a-" (null renders empty)

__print_if_tainted__(y[0]); // 'a', derived from the tainted element
