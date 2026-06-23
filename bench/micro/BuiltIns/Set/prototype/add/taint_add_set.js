// @type taint
// @target es6+ Set.prototype.add
// @feature builtin set-add

function __test_taint__(tainted) {
    // tainted = whole-tainted Set WITH elements (new Set(["x","y"]))
    tainted.add("z");
    // @witness __test_taint__(new Set(["x","y"])) => tainted = whole tainted set still tainted
    __assert_taint__(tainted, true);
    // @witness __test_taint__(new Set(["x","y"])) => Array.from(tainted)[0] = "x" tainted (existing element)
    __assert_taint__(Array.from(tainted)[0], true);
}

__test_taint__(__set_taint__(new Set(["x", "y"])));
