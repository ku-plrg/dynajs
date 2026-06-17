// @type taint
// @target es5 computed-member-access
// @feature syntax string-bracket-index

var x = "abcd";
__set_taint__(x);
var y = x[2];

__assert_taint__(y, true);
