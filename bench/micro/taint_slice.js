// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice
// ported from unit/slice.js + NodeMedic-FINE builtin_model_bugs.ts BUG B5.

// slice over the tainted middle is tainted. "abc"+taint("def")+"gh", slice(3,6)="def".
var sa = "def";
__set_taint__(sa);
sa = "abc" + sa + "gh";
__assert_taint__(sa.slice(3, 6), true);

// slice over the clean suffix is clean. slice(6,7)="g".
var sb = "def";
__set_taint__(sb);
sb = "abc" + sb + "gh";
__assert_taint__(sb.slice(6, 7), false);

// over-taint guard (B5): only 'A' is tainted; 'あ' (U+3042) stays clean through slice.
var sc = "A";
__set_taint__(sc);
var scs = (sc + "あ").slice(0); // "Aあ"
__assert_taint__(scs[1], false); // 'あ', untainted
