// @type taint
// @target es6+ Array.prototype.findLast
// @feature builtin array-findLast
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(["x","x","x"]) => tainted.findLast(() => true) = "x" tainted
    __assert_taint__(tainted.findLast(function() { return true; }), true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
