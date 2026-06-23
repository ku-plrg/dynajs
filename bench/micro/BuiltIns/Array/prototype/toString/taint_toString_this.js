// @type taint
// @target es6+ Array.prototype.toString
// @feature builtin array-toString

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.toString();
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness r[1] = ',' separator inserted by toString, clean
    __assert_taint__(r[1], false);
    // @witness __test_taint__('k') => r[2] = 'k' tainted
    __assert_taint__(r[2], true);
    // @witness r[3] = ',' separator inserted by toString, clean
    __assert_taint__(r[3], false);
    // @witness always r[4] = 'c', clean
    __assert_taint__(r[4], false);
}

__test_taint__(__set_taint__("k"));
