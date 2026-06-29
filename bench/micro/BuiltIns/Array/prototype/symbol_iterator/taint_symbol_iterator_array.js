// @type taint
// @target es6+ Array.prototype[Symbol.iterator]
// @feature builtin array-symbol_iterator

function __test_taint__(tainted) {
    var r = [...tainted[Symbol.iterator]()];
    // @witness __test_taint__(["x","x","x"]) => r = ["x","x","x"] tainted
    __assert_taint__(r, true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
