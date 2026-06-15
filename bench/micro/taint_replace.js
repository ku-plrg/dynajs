// @type taint
// @target es5 String.prototype.replace
// @feature builtin replace
// ported from unit/replace_partial.js + NodeMedic-FINE builtin_model_bugs.ts
// BUG B2 / B9 / B3.

// partial replace keeps surviving base chars tainted. "aXc".replace("X","Y")="aYc".
var ra = "aXc";
__set_taint__(ra);
__assert_taint__(ra.replace("X", "Y"), true);

// taint flowing IN via the replacement arg. "aYc".replace("Y", taint("X"))="aXc".
var rx = "X";
__set_taint__(rx);
__assert_taint__("aYc".replace("Y", rx), true);

// replace that removes the tainted substring -> clean.
// "abc"+taint("def")+"gh", replace("def","Y") = "abcYgh".
var rn = "def";
__set_taint__(rn);
rn = "abc" + rn + "gh";
__assert_taint__(rn.replace("def", "Y"), false);

// quote-doubling expands the result; the surviving base tail stays tainted (B2).
// "a'b".replace("'","''") = "a''b".
var re = "a'b";
__set_taint__(re);
__assert_taint__(re.replace("'", "''")[3], true); // 'b', from the tainted base

// global expand (B9). "a'b'c".replace(/'/g,"''") = "a''b''c".
var rg = "a'b'c";
__set_taint__(rg);
__assert_taint__(rg.replace(/'/g, "''")[6], true); // 'c', from the tainted base

// the inserted replacement literal is clean (B3, over-taint guard).
// "a1b".replace(/[0-9]/,"X") = "aXb".
var rr = "a1b";
__set_taint__(rr);
__assert_taint__(rr.replace(/[0-9]/, "X")[1], false); // 'X', clean replacement literal
