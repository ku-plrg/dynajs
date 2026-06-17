// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll

var x = "a1b2c3";
var pat = "\\d";
__set_taint__(pat);
var re = new RegExp(pat, "g");
var arr = [...x.matchAll(re)];
__assert_taint__(arr[0][0], true);
__assert_taint__(arr[1][0], true);
