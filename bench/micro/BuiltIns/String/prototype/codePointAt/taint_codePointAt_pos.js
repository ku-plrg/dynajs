// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt

var x = "hello";
var p0 = 3;
__set_taint__(p0);
__assert_taint__(x.codePointAt(p0), true);
var p1 = 99;
__set_taint__(p1);
__assert_taint__(x.codePointAt(p1), false);
