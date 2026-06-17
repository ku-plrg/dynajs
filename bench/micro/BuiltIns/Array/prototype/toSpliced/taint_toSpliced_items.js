// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

var e0 = "a";
var e1 = "b";
var e2 = "c";
var i0 = "x";
var i1 = "y";
__set_taint__(i0);
var a = [e0, e1, e2];
var r = a.toSpliced(1, 1, i0, i1);

__assert_taint__(r[0], false);
__assert_taint__(r[1], true);
__assert_taint__(r[2], false);
__assert_taint__(r[3], false);
