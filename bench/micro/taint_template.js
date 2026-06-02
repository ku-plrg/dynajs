// @type taint
// @oracle true
// ported from unit/template_literal.js

var x = "abc";
__set_taint__(x);
var s = `pre${x}suf`;

__print_if_tainted__(s);
