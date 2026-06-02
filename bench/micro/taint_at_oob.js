// @type taint
// @oracle false
// ported from unit/at_oob.js

var x = "asdf";
__set_taint__(x);
var y = x.at(99);

__print_if_tainted__(y);
