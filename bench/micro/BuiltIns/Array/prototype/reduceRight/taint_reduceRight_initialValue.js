// @type taint
// @target es6+ Array.prototype.reduceRight
// @feature builtin array-reduceRight

var e0 = "a";
var e1 = "b";
var e2 = "c";
var a = [e0, e1, e2];
var initialValue = "Z";
__set_taint__(initialValue);
var r = a.reduceRight(function (acc, v) { return acc + v; }, initialValue);

__assert_taint__(r, true);
