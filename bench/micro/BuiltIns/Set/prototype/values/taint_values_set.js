// @type taint
// @target es6+ Set.prototype.values
// @feature builtin set-values

function __test_taint__(tainted) {
    var r = Array.from(tainted.values())[0];
    // @witness __test_taint__(new Set(["x","x"])) => r = "x" tainted (existing element value)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(new Set(["a", "b"])));
