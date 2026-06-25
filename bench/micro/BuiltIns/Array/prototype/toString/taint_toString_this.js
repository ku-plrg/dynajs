// @type taint
// @target es6+ Array.prototype.toString
// @feature builtin array-toString

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.toString();   // "a,hello,c"
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness r[1] = ',' separator inserted by toString, clean
    __assert_taint__(r[1], false);
    // @witness __test_taint__('x') => r[2] = 'x' tainted (first char of tainted element)
    __assert_taint__(r[2], true);
    // @witness r[7] = ',' separator inserted by toString, clean
    __assert_taint__(r[7], false);
    // @witness always r[8] = 'c', clean
    __assert_taint__(r[8], false);
}

__test_taint__(__set_taint__("hello"));
