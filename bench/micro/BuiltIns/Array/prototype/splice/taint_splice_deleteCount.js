// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

var e0 = "a";
var e1 = "b";
var e2 = "c";
var e3 = "d";
var a = [e0, e1, e2, e3];
var dc = 2;
__set_taint__(dc);
var r = a.splice(1, dc);

// implicit branch: false
__assert_taint__(r[0], false);
__assert_taint__(r[1], false);
