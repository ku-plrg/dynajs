// @type taint
// @target es5 String.prototype.slice
// @feature builtin slice

var sa = "def";
__set_taint__(sa);
sa = "abc" + sa + "gh";
__assert_taint__(sa.slice(3, 6), true);

var sb = "def";
__set_taint__(sb);
sb = "abc" + sb + "gh";
__assert_taint__(sb.slice(6, 7), false);

var sc = "A";
__set_taint__(sc);
var scs = (sc + "あ").slice(0);
__assert_taint__(scs[1], false);
