// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    a.fill(tainted, 1, 3);
    // @witness __test_taint__('x') => a[2] = "x" tainted
    __assert_taint__(a[2], true);
}

__test_taint__(__set_taint__("hello"));
