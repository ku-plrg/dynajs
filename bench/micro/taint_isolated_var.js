// @type taint
// @oracle false
// @target es5 var-assignment
// @feature syntax isolated-var
// ported from unit/isolated_var.js

var x = "asdf";
var y = "foo";
__set_taint__(x);

__print_if_tainted__(y);
