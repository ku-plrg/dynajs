// @type taint
// @oracle false
// @target es6+ String.prototype.at
// @feature builtin at-untainted
// ported from unit/clean_at.js

var x = "asdf";
var y = x.at(0);

__print_if_tainted__(y);
