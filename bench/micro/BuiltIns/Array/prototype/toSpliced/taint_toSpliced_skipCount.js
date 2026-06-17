// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, e1, e2];
var k = 1;
__set_taint__(k);
var r = a.toSpliced(1, k);

__assert_taint__(r[0], true);
__assert_taint__(r[1], true);
