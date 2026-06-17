// @type taint
// @target es6+ String.prototype.normalize
// @feature builtin normalize

var x = "foo";
var f = "NFC";
__set_taint__(f);
var r = x.normalize(f);
__assert_taint__(r, true);
