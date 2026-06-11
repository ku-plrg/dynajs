// @type taint
// @oracle true
// @target es5 String.prototype.replace
// @feature builtin replace-expand
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B2: the classic SQL quote
// doubling sanitizer "a'b".replace("'","''") === "a''b" expands the result by one
// char. An encoding model whose tainted base char no longer matches the clean
// search literal fails the match, truncates the model result, and drops the
// tainted 'b' suffix. We probe the surviving base char at the expanded tail index;
// the correct answer is tainted.

var x = "a'b";
__set_taint__(x);
var y = x.replace("'", "''"); // "a''b", length 4

__print_if_tainted__(y[3]); // 'b', derived from the tainted base
