// @type taint
// @target es5 String.prototype.substring
// @feature builtin substring

var na = "abcde";
__set_taint__(na);
__assert_taint__(na.substring(-3)[0], true);

var sw = "0123456789";
__set_taint__(sw);
__assert_taint__(sw.substring(6, 2)[0], true);
