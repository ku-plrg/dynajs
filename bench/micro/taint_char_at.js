// @type taint
// @oracle true
// ported from unit/at.js

var x = "asdf";
__set_taint__(x);
var y = x.at(0);

__print_if_tainted__(y);
