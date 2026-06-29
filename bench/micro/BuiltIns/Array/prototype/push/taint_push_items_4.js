// @type taint
// @target es6+ Array.prototype.push
// @feature builtin array-push
// @done

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.push(tainted);
    // @witness __test_taint__('x') => a[a.length - 1] = 'x' tainted
    __assert_taint__(a[a.length - 1], true);
}

__test_taint__(__set_taint__("hello"));
