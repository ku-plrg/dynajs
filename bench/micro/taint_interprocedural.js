// @type taint
// @oracle true
// @target es6+ String.prototype.at
// @feature builtin interprocedural-at
// ported from unit/transparent_preserves_chars.js

function f(s) { return "pre" + s.at(0); }
var x = "abc";
__set_taint__(x);
var y = f(x);

__print_if_tainted__(y);
