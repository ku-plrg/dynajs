// @type taint
// @target es5 Array.prototype.reduce
// @feature builtin array-reduce

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.reduce(function(acc, v) { return acc + v; }, "");
    // @witness __test_taint__(["x","y","z"]) => r = "xyz" tainted (accumulates tainted elements)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
