// @type taint
// @target es5 var-assignment
// @feature syntax var-assignment

var ix = "asdf";
__set_taint__(ix);
var iy = ix;
__assert_taint__(iy, true);

var ux = "asdf";
var uy = "foo";
__set_taint__(ux);
__assert_taint__(uy, false);
