// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    tainted.copyWithin(0, 1);
    // @witness __test_taint__(["x","y","z"]) => tainted[0] = "y" tainted
    __assert_taint__(tainted[0], true);
    // @witness __test_taint__(["x","y","z"]) => tainted[1] = "z" tainted
    __assert_taint__(tainted[1], true);
    // @witness __test_taint__(["x","y","z"]) => tainted[2] = "z" tainted
    __assert_taint__(tainted[2], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
