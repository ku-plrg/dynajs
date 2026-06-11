// @type taint
// @oracle false
// @target es5 Array.prototype.concat
// @feature builtin array-concat
// Mirrors NodeMedic-FINE builtin_model_bugs.ts BUG B13 (over-taint / false
// positive): ["s"].concat(["u"]) === ['s','u']. Only the base array element is
// tainted; the element appended from the argument array is clean and must stay
// clean. A model that blanket-taints the whole result when the base is fully
// tainted over-taints the appended element. We probe r[1] ('u', from the clean
// argument array); correct = clean.

var s = "s";
__set_taint__(s);
var a = [s];
var b = ["u"];
var r = a.concat(b); // ['s','u']

__print_if_tainted__(r[1]); // 'u', from the clean argument array
