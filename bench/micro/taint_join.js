// @type taint
// @target es5 Array.prototype.join
// @feature builtin join

var ja = "a";
__set_taint__(ja);
var jr = [ja, null].join("-");
__assert_taint__(jr[0], true);

var sep = "XX";
__set_taint__(sep);
var sr = ["a", "b"].join(sep);
__assert_taint__(sr[1], true);
