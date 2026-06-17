// @type taint
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase

var x = "ABC";
var loc = "tr";
__set_taint__(loc);
var r = x.toLocaleLowerCase(loc);
__assert_taint__(r.charAt(0), true);
__assert_taint__(r.charAt(1), true);
__assert_taint__(r.charAt(2), true);
