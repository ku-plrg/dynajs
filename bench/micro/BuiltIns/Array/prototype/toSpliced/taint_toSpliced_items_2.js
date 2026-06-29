// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.toSpliced(1, 1, tainted, "y");
    // @witness __test_taint__('x') => r[1] = 'x' tainted
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__("hello"));
