// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, e1, e2];
var s = 1;
__set_taint__(s);
var r = a.toSpliced(s, 1);

// implicit branch: false
__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
