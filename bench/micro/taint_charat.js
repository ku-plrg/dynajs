// @type taint
// @target es5 String.prototype.charAt
// @feature builtin charAt

var ca = "asdf";
__set_taint__(ca);
__assert_taint__(ca.charAt(0), true);

var cb = "asdf";
__set_taint__(cb);
cb = cb + "qwer";
__assert_taint__(cb.charAt(4), false);
