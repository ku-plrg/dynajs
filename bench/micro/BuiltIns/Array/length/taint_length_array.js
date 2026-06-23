// @type taint
// @target es5 Array.prototype.length
// @feature builtin array-length

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var n = tainted.length;
    // @witness __test_taint__(["x","y","z"]) => n = 3 tainted (count)
    __assert_taint__(n, true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
