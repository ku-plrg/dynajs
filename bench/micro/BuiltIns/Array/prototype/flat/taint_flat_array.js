// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.flat();
    // @witness __test_taint__(["x","y","z"]) => r[0] = "x" tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
