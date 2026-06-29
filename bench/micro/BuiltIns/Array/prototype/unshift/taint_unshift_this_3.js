// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.unshift("c");
    // @witness __test_taint__('x') => a[1] = 'x' tainted
    __assert_taint__(a[1], true);
}

__test_taint__(__set_taint__("hello"));
