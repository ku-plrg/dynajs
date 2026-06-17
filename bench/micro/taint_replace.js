// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace

var ra = "aXc";
__set_taint__(ra);
__assert_taint__(ra.replace("X", "Y"), true);

var rx = "X";
__set_taint__(rx);
__assert_taint__("aYc".replace("Y", rx), true);

var rn = "def";
__set_taint__(rn);
rn = "abc" + rn + "gh";
__assert_taint__(rn.replace("def", "Y"), false);

var re = "a'b";
__set_taint__(re);
__assert_taint__(re.replace("'", "''")[3], true);

var rg = "a'b'c";
__set_taint__(rg);
__assert_taint__(rg.replace(/'/g, "''")[6], true);

var rr = "a1b";
__set_taint__(rr);
__assert_taint__(rr.replace(/[0-9]/, "X")[1], false);
