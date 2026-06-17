// @type taint
// @target es5 String.prototype.search
// @feature builtin search

var x = "hello123";
var pat = "[0-9]";
__set_taint__(pat);
var re = new RegExp(pat);
__assert_taint__(x.search(re), true);
var pat2 = "z";
__set_taint__(pat2);
var re2 = new RegExp(pat2);
__assert_taint__(x.search(re2), false);
