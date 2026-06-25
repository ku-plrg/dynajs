// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.unshift(tainted);
    // @witness unshift returns a length (number), clean
    __assert_taint__(len, false);
    // @witness __test_taint__('x') => a[0] = 'x' tainted
    __assert_taint__(a[0], true);
    // @witness always a[1] = "a", clean
    __assert_taint__(a[1], false);
    // @witness always a[2] = "b", clean
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));
