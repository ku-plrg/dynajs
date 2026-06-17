// @type taint
// @target es5 binary-plus
// @feature syntax binary-plus

var sx = "asdf";
__set_taint__(sx);
__assert_taint__(sx + "1234", true);

var nx = 5;
__set_taint__(nx);
__assert_taint__(nx + 1, true);

__assert_taint__("asdf" + "1234", false);
