// @type taint
// @target es6+ Set.prototype[Symbol.iterator]
// @feature builtin set-symbol_iterator

function __test_taint__(tainted) {
    var r = Array.from(tainted)[0];
    // @witness __test_taint__(new Set(["x","x"])) => r = "x" tainted (first element from iterator)
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(new Set(["a", "b"])));
