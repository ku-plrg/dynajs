// @type taint
// @target es6+ Array.prototype.reduce
// @feature builtin array-reduce
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.reduce(function (acc, v) { return acc + v; }, tainted);
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__("hello"));
