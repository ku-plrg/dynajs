// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

var e0 = "a";
var e1 = "b";
var a = [e0, e1];
var item = "c";
__set_taint__(item);
var len = a.unshift(item);

__assert_taint__(len, false);
__assert_taint__(a[0], true);
__assert_taint__(a[1], false);
__assert_taint__(a[2], false);
