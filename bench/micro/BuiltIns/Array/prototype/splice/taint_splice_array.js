// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.splice(0, 1);
    // @witness __test_taint__(["x","y","z"]) => r[0] = "x" tainted (removed existing)
    __assert_taint__(r[0], true);
    // @witness __test_taint__(["x","y","z"]) => tainted[0] = "y" tainted (remaining)
    __assert_taint__(tainted[0], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
