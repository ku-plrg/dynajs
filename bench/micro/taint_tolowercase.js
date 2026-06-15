// @type taint
// @target es6+ String.prototype.toLowerCase
// @feature builtin toLowerCase
// ported from unit/toLowerCase.js. 'İ' (U+0130) lowercases to two code units
// ('i' + combining dot U+0307), exercising 1->many char mapping.

// the expansion char derives from the tainted base -> tainted.
var lx = "İ";
__set_taint__(lx);
__assert_taint__(lx.toLowerCase()[1], true);

// the final char of (taint("İ") + "İ").toLowerCase() comes from the clean
// trailing 'İ' literal -> clean.
var mx = "İ";
__set_taint__(mx);
var my = (mx + "İ").toLowerCase();
__assert_taint__(my[my.length - 1], false);
