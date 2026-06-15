// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring
// NodeMedic-FINE string_model_bugs.ts BUG A3 + A2: substring clamps negative
// indices to 0 and swaps its args when start > end; a naive Array.slice model
// drops the tainted bytes either way.

// negative-index clamp (A3): "abcde".substring(-3) === "abcde" (whole string).
var na = "abcde";
__set_taint__(na);
__assert_taint__(na.substring(-3)[0], true); // 'a', from the tainted base

// arg swap (A2): "0123456789".substring(6, 2) === "2345" (JS swaps to (2, 6)).
var sw = "0123456789";
__set_taint__(sw);
__assert_taint__(sw.substring(6, 2)[0], true); // '2', from the tainted base
