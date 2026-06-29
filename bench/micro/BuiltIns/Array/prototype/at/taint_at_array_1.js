// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["a","b","c"])
    // @witness __test_taint__(["x","x","x"]) => tainted.at(0) = "x" tainted
    __assert_taint__(tainted.at(0), true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
