// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.toSpliced(1, 1, tainted, "y");
    // @witness always r[0] = "a", clean
    __assert_taint__(r[0], false);
    // @witness __test_taint__('x') => r[1] = 'x' tainted
    __assert_taint__(r[1], true);
    // @witness always r[2] = "y", clean
    __assert_taint__(r[2], false);
    // @witness always r[3] = "c", clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
