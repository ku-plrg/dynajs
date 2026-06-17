// @type taint
// @target es6+ Array.prototype.reduceRight
// @feature builtin array-reduceRight

var e0 = "a";
var e1 = "b";
var e2 = "c";
__set_taint__(e0);
__set_taint__(e2);
var a = [e0, e1, e2];
var r = a.reduceRight(function (acc, v) { return acc + v; });

__assert_taint__(r, true);
