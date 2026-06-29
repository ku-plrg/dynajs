// @type taint
// @target es6+ Array.prototype[Symbol.iterator]
// @feature builtin array-symbol_iterator

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = [...a[Symbol.iterator]()];
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
    // @witness always r[1] = "b", clean
    __assert_taint__(r[1], false);
    // @witness always r[2] = "c", clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));
