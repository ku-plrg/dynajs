// @type taint
// @oracle false
// ported from unit/clean_at.js

var x = "asdf";
var y = x.at(0);

__print_if_tainted__(y);
