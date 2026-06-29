// @type taint
// @target es6+ Array.prototype.toSorted
// @feature builtin array-toSorted

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.toSorted(function (x, y) { return x < y ? 1 : -1; });
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__("hello"));
