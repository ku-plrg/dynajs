// @type taint
// @target es5 Array.prototype.join
// @feature builtin join
// Array.prototype.join taint propagation (NodeMedic-FINE builtin_model_bugs.ts
// BUG B8 + B6): both the elements and the separator must carry taint.

// null/undefined elements render as "" (a toString-based model must not crash on
// them); the tainted element survives. ["a",null].join("-") === "a-".  (B8)
var ja = "a";
__set_taint__(ja);
var jr = [ja, null].join("-"); // "a-"
__assert_taint__(jr[0], true); // 'a', from the tainted element

// a tainted separator taints the glue bytes. ["a","b"].join("XX") === "aXXb".  (B6)
var sep = "XX";
__set_taint__(sep);
var sr = ["a", "b"].join(sep); // "aXXb"
__assert_taint__(sr[1], true); // 'X', from the tainted separator
