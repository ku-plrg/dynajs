// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt

var x = "hello";
var p0 = 3;
__set_taint__(p0);
__assert_taint__(x.charCodeAt(p0), true);
var p1 = 99;
__set_taint__(p1);
__assert_taint__(x.charCodeAt(p1), false);
