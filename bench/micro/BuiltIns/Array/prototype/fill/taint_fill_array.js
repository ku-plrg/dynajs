// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    tainted.fill("q", 1, 3);
    // @witness __test_taint__(["x","y","z"]) => tainted[0] = "x" tainted (untouched)
    __assert_taint__(tainted[0], true);
    // @witness always tainted[1] = "q" clean fill literal
    __assert_taint__(tainted[1], false);
    // @witness always tainted[2] = "q" clean fill literal
    __assert_taint__(tainted[2], false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
