// @type taint
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare

var x = "banana";
var t = "apple";
__set_taint__(t);
__assert_taint__(x.localeCompare(t), false);
var t2 = "cherry";
__set_taint__(t2);
__assert_taint__(x.localeCompare(t2), false);
