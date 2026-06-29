// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var r = tainted.toSpliced(0, 1, "q");
    // @witness __test_taint__(["x","x","x"]) => r = ["q", "x", "x"] tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
