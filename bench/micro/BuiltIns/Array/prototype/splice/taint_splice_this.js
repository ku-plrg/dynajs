// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d", "e"];
    a.splice(1, 2);
    // @witness __test_taint__('x') => a[0] = 'x' tainted
    __assert_taint__(a[0], true);
    // @witness always a[1] = "d", clean
    __assert_taint__(a[1], false);
    // @witness always a[2] = "e", clean
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));
