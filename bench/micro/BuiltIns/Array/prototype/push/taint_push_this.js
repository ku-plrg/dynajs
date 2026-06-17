// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push

var e0 = "a";
var e1 = "b";
__set_taint__(e0);
var a = [e0, e1];
var item = "c";
var len = a.push(item);

__assert_taint__(len, false);
__assert_taint__(a[0], true);
__assert_taint__(a[1], false);
__assert_taint__(a[2], false);
