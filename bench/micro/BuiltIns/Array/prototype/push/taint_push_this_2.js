// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push
// 

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.push("c");
    // @witness __test_taint__('x') => a[0] = 'x' tainted
    __assert_taint__(a[0], true);
}

__test_taint__(__set_taint__("hello"));
