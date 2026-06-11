// @type taint
// @oracle false
// @target es5 String.prototype.replace
// @feature builtin replace-regex-literal
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B3 (over-taint / false
// positive): "a1b".replace(/[0-9]/,"X") === "aXb". The inserted 'X' comes from the
// clean replacement literal, so it must be UNtainted even though the base is
// tainted. A model whose regex never matches the encoded base leaves the tainted
// '1' in place and over-taints index 1. We probe it; the correct answer is clean.

var x = "a1b";
__set_taint__(x);
var y = x.replace(/[0-9]/, "X"); // "aXb"

__print_if_tainted__(y[1]); // 'X', from the clean replacement literal
