// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.unshift(tainted);
    // @witness __test_taint__('x') => a[0] = 'x' tainted
    __assert_taint__(a[0], true);
}

__test_taint__(__set_taint__("hello"));
