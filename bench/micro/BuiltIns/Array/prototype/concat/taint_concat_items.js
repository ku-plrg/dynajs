// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat

var e0 = "a";
var e1 = "b";
var i0 = "c";
var i1 = "d";
__set_taint__(i0);
var a = [e0, e1];
var r = a.concat([i0, i1]);

__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
__assert_taint__(r[2], true);
__assert_taint__(r[3], false);
