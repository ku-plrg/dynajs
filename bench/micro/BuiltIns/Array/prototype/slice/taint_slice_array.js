// @type taint
// @target es5 Array.prototype.slice
// @feature builtin array-slice

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.slice(0, 2);
    // @witness __test_taint__(["x","y","z"]) => r[0] = "x" tainted
    __assert_taint__(r[0], true);
    // @witness __test_taint__(["x","y","z"]) => r[1] = "y" tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
