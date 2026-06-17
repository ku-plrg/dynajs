// @type taint
// @target es5 String.prototype.split
// @feature builtin split

var x = "aXb";
var sep = "X";
__set_taint__(sep);
var parts = x.split(sep);
__assert_taint__(parts[0], true);
__assert_taint__(parts[1], true);
