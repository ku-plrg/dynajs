// @type taint
// @oracle false
// @target es5 String.prototype.split
// @feature builtin split-regex-offset
// Negative companion to taint_split_regex.js (NodeMedic-FINE builtin_model_bugs.ts
// BUG B7). The same "aX" + taint("b") + "Xc" splits on /X/ into ["a","b","c"], and
// parts[2] === "c" comes from the clean suffix, so it must be UNtainted. A drifted
// per-byte offset (from using String(/X/).length for the separator width) would
// over-taint it. We probe parts[2]; the correct answer is clean.

var t = "b";
__set_taint__(t);
var base = "aX" + t + "Xc"; // "aXbXc"
var parts = base.split(/X/); // ["a","b","c"]

__print_if_tainted__(parts[2]); // "c", from the clean suffix
