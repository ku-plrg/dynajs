// @type taint
// @target es6+ Array.prototype.flat
// @feature builtin array-flat
// @done

function __test_taint__(tainted) {
    var a = ["a", ["b", tainted], "d"];
    var r = a.flat();
    // @witness __test_taint__('x') => r[2] = 'x' tainted
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("hello"));
