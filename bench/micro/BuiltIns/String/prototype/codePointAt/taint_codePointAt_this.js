// @type taint
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
__assert_taint__(x.codePointAt(0), true);
__assert_taint__(x.codePointAt(1), false);
__assert_taint__(x.codePointAt(2), true);
__assert_taint__(x.codePointAt(99), false);
