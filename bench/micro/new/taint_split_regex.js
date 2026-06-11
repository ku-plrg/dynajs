// @type taint
// @oracle true
// @target es5 String.prototype.split
// @feature builtin split-regex-offset
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B7: split with a REGEX separator
// must map taint by the chars actually consumed, not by String(/X/).length (= 3).
// Only the middle word is tainted: "aX" + taint("b") + "Xc" -> split(/X/) yields
// ["a","b","c"], and parts[1] === "b" is the tainted word. A model that uses the
// stringified-regex length for separator width drifts and mis-maps the taint. We
// probe parts[1]; the correct answer is tainted. (Negative companion:
// taint_split_regex_neg.js probes the clean parts[2].)

var t = "b";
__set_taint__(t);
var base = "aX" + t + "Xc"; // "aXbXc"
var parts = base.split(/X/); // ["a","b","c"]

__print_if_tainted__(parts[1]); // "b", the tainted word
