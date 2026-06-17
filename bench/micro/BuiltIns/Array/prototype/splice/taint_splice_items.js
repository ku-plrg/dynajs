// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

var e0 = "a";
var e1 = "b";
var e2 = "c";
var i0 = "X";
var i1 = "Y";
__set_taint__(i0);
var a = [e0, e1, e2];
a.splice(1, 0, i0, i1);

__assert_taint__(a[0], false);
__assert_taint__(a[1], true);
__assert_taint__(a[2], false);
