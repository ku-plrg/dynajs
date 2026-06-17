// @type taint
// @target es5 String.prototype.match
// @feature builtin match

var x = "hello123";
var pat = "\\d+";
__set_taint__(pat);
var re = new RegExp(pat);
var m = x.match(re);
__assert_taint__(m[0], true);
