// @type taint
// @target es6+ Array.prototype.flatMap
// @feature builtin array-flatMap
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.flatMap(function (v) { return [v]; });
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__("hello"));
