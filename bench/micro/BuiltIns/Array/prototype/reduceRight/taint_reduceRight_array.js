// @type taint
// @target es5 Array.prototype.reduceRight
// @feature builtin array-reduceRight

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.reduceRight(function(acc, v) { return acc + v; }, "");
    // @witness __test_taint__(["x","y","z"]) => r = "zyx" tainted (accumulates tainted elements)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
