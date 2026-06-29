// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d", "e"];

    var r = a.splice(1, 2);
    // @witness __test_taint__('x') => a[0] = 'x' tainted
    __assert_taint__(a[0], true);
}

__test_taint__(__set_taint__("hello"));
