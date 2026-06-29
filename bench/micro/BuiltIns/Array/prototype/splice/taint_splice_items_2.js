// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    a.splice(1, 0, tainted, "Y");
    // @witness __test_taint__('x') => a[1] = 'x' tainted
    __assert_taint__(a[1], true);
}

__test_taint__(__set_taint__("hello"));
