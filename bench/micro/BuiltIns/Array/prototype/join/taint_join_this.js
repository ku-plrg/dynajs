// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.join(",");
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness r[1] = ',' separator inserted by join, clean
    __assert_taint__(r[1], false);
    // @witness __test_taint__('k') => r[2] = 'k' tainted
    __assert_taint__(r[2], true);
    // @witness r[3] = ',' separator inserted by join, clean
    __assert_taint__(r[3], false);
    // @witness always r[4] = 'c', clean
    __assert_taint__(r[4], false);
}

__test_taint__(__set_taint__("k"));
