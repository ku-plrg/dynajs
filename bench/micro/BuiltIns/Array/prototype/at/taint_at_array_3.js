// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(["x","x","x"]) => tainted.at(-1) = "x" tainted
    __assert_taint__(tainted.at(-1), true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
