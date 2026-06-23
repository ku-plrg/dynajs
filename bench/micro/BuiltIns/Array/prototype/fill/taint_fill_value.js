// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    a.fill(tainted, 1, 3);
    // @witness always a[0] = 'a', clean
    __assert_taint__(a[0], false);
    // @witness __test_taint__('x') => a[1] = "x" tainted
    __assert_taint__(a[1], true);
    // @witness __test_taint__('x') => a[2] = "x" tainted
    __assert_taint__(a[2], true);
    // @witness always a[3] = 'd', clean
    __assert_taint__(a[3], false);
}

__test_taint__(__set_taint__("hello"));
