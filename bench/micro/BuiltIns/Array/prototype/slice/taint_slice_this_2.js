// @type taint
// @target es6+ Array.prototype.slice
// @feature builtin array-slice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted, "d"];
    var r = a.slice(1, 3);
    // @witness __test_taint__('x') => r[1] = 'x' tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__("hello"));
