// @type taint
// @target es6+ Array.prototype.values
// @feature builtin array-values
// @done

function __test_taint__(tainted) {
    var r = [...tainted.values()];
    // @witness __test_taint__(["x","x","x"]) => r = [["x"],["x"],["x"]] tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
