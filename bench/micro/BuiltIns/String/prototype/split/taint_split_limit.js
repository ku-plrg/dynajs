// @type taint
// @target es5 String.prototype.split
// @feature builtin split

var x = "a,b,c";
var lim = 2;
__set_taint__(lim);
var parts = x.split(",", lim);
__assert_taint__(parts[0], true);
__assert_taint__(parts[1], true);
