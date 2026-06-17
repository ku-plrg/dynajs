// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
var a = [e0, e1, e2];

var i0 = 0;
__set_taint__(i0);
var z0 = a.at(i0);
__assert_taint__(z0, true);

var i1 = 99;
__set_taint__(i1);
var z1 = a.at(i1);
__assert_taint__(z1, false);
