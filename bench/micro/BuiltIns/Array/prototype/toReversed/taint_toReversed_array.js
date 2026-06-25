// @type taint
// @target es6+ Array.prototype.toReversed
// @feature builtin array-toReversed

function __test_taint__(tainted) {
    var r = tainted.toReversed();
    // @witness __test_taint__(["x","x","x"]) => r[0] = "x" tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
