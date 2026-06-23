// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    // @witness __test_taint__(["x","y","z"]) => tainted.at(0) = "x" tainted
    __assert_taint__(tainted.at(0), true);
    // @witness __test_taint__(["x","y","z"]) => tainted.at(1) = "y" tainted
    __assert_taint__(tainted.at(1), true);
    // @witness __test_taint__(["x","y","z"]) => tainted.at(-1) = "z" tainted
    __assert_taint__(tainted.at(-1), true);
    // @witness always tainted.at(tainted.length) = undefined (OOB), clean
    __assert_taint__(tainted.at(tainted.length), false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
