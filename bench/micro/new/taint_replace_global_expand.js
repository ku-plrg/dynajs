// @type taint
// @oracle true
// @target es5 String.prototype.replace
// @feature builtin replace-global-expand
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B9 (global variant of B2):
// "a'b'c".replace(/'/g,"''") === "a''b''c" (5 -> 7 chars). Every char of the real
// result derives from the tainted base. An encoding model whose tainted base never
// matches the regex performs no replacement, yields a shorter result, and drops
// the tainted tail. We probe the last char; correct = tainted.

var x = "a'b'c";
__set_taint__(x);
var y = x.replace(/'/g, "''"); // "a''b''c", 7 chars

__print_if_tainted__(y[6]); // 'c', derived from the tainted base
