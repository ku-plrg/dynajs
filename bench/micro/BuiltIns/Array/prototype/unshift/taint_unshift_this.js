// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.unshift("c");
    // @witness unshift returns a length (number), clean
    __assert_taint__(len, false);
    // @witness always a[0] = "c", clean
    __assert_taint__(a[0], false);
    // @witness __test_taint__('hello') => a[1] = 'hello' tainted
    __assert_taint__(a[1], true);
    // @witness always a[2] = "b", clean
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));
