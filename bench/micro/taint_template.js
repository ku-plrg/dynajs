// @type taint
// @target es6+ template-literal
// @feature syntax template-literal

var x = "abc";
__set_taint__(x);
var s = `pre${x}suf`;

__assert_taint__(s, true);
