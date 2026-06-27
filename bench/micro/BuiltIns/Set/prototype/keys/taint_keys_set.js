// @type taint
// @target es6+ Set.prototype.keys
// @feature builtin set-keys

function __test_taint__(tainted) {
    var r = Array.from(tainted.keys())[0];
    // @witness __test_taint__(new Set(["x","x"])) => r = "x" tainted (attacker-supplied key/value)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(new Set(["a", "b"])));
