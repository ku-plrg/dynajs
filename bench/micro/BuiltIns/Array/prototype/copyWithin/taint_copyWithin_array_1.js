// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin
// @done

function __test_taint__(tainted) {
    tainted.copyWithin(0, 1);
    // @witness __test_taint__(["x","x","x"]) => tainted[0] = "x" tainted
    __assert_taint__(tainted[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
