// @type taint
// @target es6+ Array.prototype.filter
// @feature builtin array-filter
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.filter(function (v) { return true; });
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__("hello"));
