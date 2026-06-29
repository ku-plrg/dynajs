// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["a","b","c"])
    tainted.fill("q", 1, 3);
    // @witness __test_taint__(["x","y","z"]) => tainted[0] = "x" tainted (untouched)
    __assert_taint__(tainted[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
