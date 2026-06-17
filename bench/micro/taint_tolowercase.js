// @type taint
// @target es6+ String.prototype.toLowerCase
// @feature builtin toLowerCase

var lx = "İ";
__set_taint__(lx);
__assert_taint__(lx.toLowerCase()[1], true);

var mx = "İ";
__set_taint__(mx);
var my = (mx + "İ").toLowerCase();
__assert_taint__(my[my.length - 1], false);
