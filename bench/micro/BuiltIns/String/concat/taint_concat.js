// @type taint
// @target es5 String.prototype.concat
// @feature builtin concat

var x1 = "f";
var x2 = "o";
var x3 = "o";
__set_taint__(x1);
__set_taint__(x3);
var x = x1.concat(x2, x3);


__assert_taint__(x[0], true);
__assert_taint__(x[1], false);
__assert_taint__(x[2], true);