// @type taint
// @target es6+ Array.prototype.find
// @feature builtin array-find
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(["x","x","x"]) => tainted.find(() => true) = "x" tainted
    __assert_taint__(tainted.find(function() { return true; }), true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
