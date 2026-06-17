// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push

var e0 = "a";
var e1 = "b";
var a = [e0, e1];
var item = "c";
__set_taint__(item);
var len = a.push(item);

__assert_taint__(len, false);
__assert_taint__(a[0], false);
__assert_taint__(a[1], false);
__assert_taint__(a[a.length - 1], true);
