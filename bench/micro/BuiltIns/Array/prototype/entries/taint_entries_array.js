// @type taint
// @target es6+ Array.prototype.entries
// @feature builtin array-entries
// @done

function __test_taint__(tainted) {
    var e = [...tainted.entries()];
    // @witness always e[0][0] = 0, array index (position), clean
    __assert_taint__(e[0][0], false);
    // @witness __test_taint__(["x","y","z"]) => e[0][1] = "x" tainted
    __assert_taint__(e[0][1], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
