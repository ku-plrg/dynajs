// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var r = tainted.splice(0, 1);
    // @witness __test_taint__(["x","x","x"]) => r[0] = "x" tainted (removed existing)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
