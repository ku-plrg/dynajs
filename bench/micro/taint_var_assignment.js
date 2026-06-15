// @type taint
// @target es5 var-assignment
// @feature syntax var-assignment
// ported from unit/isolated_var.js

// taint flows along a plain identifier copy.
var ix = "asdf";
__set_taint__(ix);
var iy = ix;
__assert_taint__(iy, true);

// an unrelated variable stays clean when a different var is tainted.
var ux = "asdf";
var uy = "foo";
__set_taint__(ux);
__assert_taint__(uy, false);
