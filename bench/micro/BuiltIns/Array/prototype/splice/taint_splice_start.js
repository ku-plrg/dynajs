// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var a = [e0, e1, e2, e3];
var s = 1;
__set_taint__(s);
var r = a.splice(s, 2);

__assert_taint__(r[0], true);
__assert_taint__(r[1], true);
