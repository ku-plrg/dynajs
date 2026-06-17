// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring

var x = "hello";
var e0 = 4;
__set_taint__(e0);
var y = x.substring(1, e0);
__assert_taint__(y, true);

var e1 = 0;
__set_taint__(e1);
var z = x.substring(0, e1);
__assert_taint__(z, false);
