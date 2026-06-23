// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d", tainted];
    a.copyWithin(0, 3, 5);
    // @witness always a[0] = 'd', clean
    __assert_taint__(a[0], false);
    // @witness __test_taint__('x') => a[1] = "x" tainted
    __assert_taint__(a[1], true);
    // @witness always a[2] = 'c', clean
    __assert_taint__(a[2], false);
    // @witness always a[3] = 'd', clean
    __assert_taint__(a[3], false);
    // @witness __test_taint__('x') => a[4] = "x" tainted
    __assert_taint__(a[4], true);
}

__test_taint__(__set_taint__("hello"));
