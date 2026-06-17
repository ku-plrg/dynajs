// @type taint
// @target es5 String.prototype.match
// @feature builtin match

var d0 = "1";
var d1 = "2";
__set_taint__(d0);
var x = "ab" + d0 + d1;
var m = x.match(/\d+/);
__assert_taint__(m[0], true);
__assert_taint__(m[0][0], true);
__assert_taint__(m[0][1], false);
__assert_taint__(x.match(/zzz/), false);
