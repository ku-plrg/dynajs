// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.join(tainted);
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness __test_taint__('-') => r[1] = '-' tainted
    __assert_taint__(r[1], true);
    // @witness always r[2] = 'b', clean
    __assert_taint__(r[2], false);
    // @witness __test_taint__('-') => r[3] = '-' tainted
    __assert_taint__(r[3], true);
    // @witness always r[4] = 'c', clean
    __assert_taint__(r[4], false);
}

__test_taint__(__set_taint__("-"));
