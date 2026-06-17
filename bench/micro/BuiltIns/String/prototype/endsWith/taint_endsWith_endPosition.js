// @type taint
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith

var x = "foobar";
var ep = 3;
__set_taint__(ep);
__assert_taint__(x.endsWith("foo", ep), false);
