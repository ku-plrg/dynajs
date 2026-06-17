// @type taint
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll

var d0 = "1";
var d1 = "2";
__set_taint__(d0);
var x = "a" + d0 + "b" + d1;
var re = /\d/g;
var arr = [...x.matchAll(re)];
__assert_taint__(arr[0][0], true);
__assert_taint__(arr[0][0][0], true);
__assert_taint__(arr[1][0][0], false);
