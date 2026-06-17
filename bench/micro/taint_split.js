// @type taint
// @target es5 String.prototype.split
// @feature builtin split

var pa = "key=val";
__set_taint__(pa);
__assert_taint__(pa.split("=")[1], true);

var pb = "abcd";
__set_taint__(pb);
pb = "zz" + pb;
__assert_taint__(pb.split("")[0], false);

var pt = "b";
__set_taint__(pt);
var parts = ("aX" + pt + "Xc").split(/X/);
__assert_taint__(parts[1], true);
__assert_taint__(parts[2], false);
