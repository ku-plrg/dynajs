// @type taint
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase

var x = "abc";
var loc = "tr";
__set_taint__(loc);
var r = x.toLocaleUpperCase(loc);
__assert_taint__(r.charAt(0), true);
__assert_taint__(r.charAt(1), true);
__assert_taint__(r.charAt(2), true);
