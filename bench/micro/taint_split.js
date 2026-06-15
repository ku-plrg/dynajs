// @type taint
// @target es5 String.prototype.split
// @feature builtin split
// ported from unit/split_index.js + NodeMedic-FINE builtin_model_bugs.ts BUG B7.

// split keeps the tainted field. "key=val" tainted, split("=")[1] === "val".
var pa = "key=val";
__set_taint__(pa);
__assert_taint__(pa.split("=")[1], true);

// split landing in the clean prefix is clean. "zz"+taint("abcd"), split("")[0]==='z'.
var pb = "abcd";
__set_taint__(pb);
pb = "zz" + pb;
__assert_taint__(pb.split("")[0], false);

// a REGEX separator must map taint by the chars actually consumed, not by
// String(/X/).length (B7). "aX"+taint("b")+"Xc" split(/X/) -> ["a","b","c"]:
// parts[1]="b" is the tainted word, parts[2]="c" comes from the clean suffix.
var pt = "b";
__set_taint__(pt);
var parts = ("aX" + pt + "Xc").split(/X/); // ["a","b","c"]
__assert_taint__(parts[1], true); // "b", tainted word
__assert_taint__(parts[2], false); // "c", clean suffix
