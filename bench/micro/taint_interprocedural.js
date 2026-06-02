// @type taint
// @oracle true
// ported from unit/transparent_preserves_chars.js

function f(s) { return "pre" + s.at(0); }
var x = "abc";
__set_taint__(x);
var y = f(x);

__print_if_tainted__(y);
