// @type taint
// @target es6+ String.prototype.charCodeAt
// @feature builtin charCodeAt

var x0 = "f";
var x1 = "o";
var x2 = "o";
__set_taint__(x0);
__set_taint__(x2);
var x = x0 + x1 + x2;
__assert_taint__(x.charCodeAt(0), true);
__assert_taint__(x.charCodeAt(1), false);
__assert_taint__(x.charCodeAt(2), true);
__assert_taint__(x.charCodeAt(99), false);
