// @type taint
// @target es6+ Array.prototype.sort
// @feature builtin array-sort

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.sort(function (x, y) { return x < y ? 1 : -1; });
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
    // @witness always r[1] = "c", clean
    __assert_taint__(r[1], false);
    // @witness always r[2] = "b", clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));
