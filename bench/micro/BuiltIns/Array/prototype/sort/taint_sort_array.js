// @type taint
// @target es6+ Array.prototype.sort
// @feature builtin array-sort
// @done

function __test_taint__(tainted) {
    var r = tainted.sort();
    // @witness __test_taint__(["x","x","x"]) => r[0] = "x" tainted
    __assert_taint__(r[0], true);
    // @witness __test_taint__(["x","x","x"]) => r = ["x", "x", "x"] tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
