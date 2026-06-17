// @type taint
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll

var x = "a-b-c";
var s = "-";
__set_taint__(s);
var r = x.replaceAll(s, "+");
__assert_taint__(r[1], true);
__assert_taint__(r[3], true);
