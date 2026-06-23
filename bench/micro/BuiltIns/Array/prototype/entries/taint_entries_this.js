// @type taint
// @target es6+ Array.prototype.entries
// @feature builtin array-entries
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = [...a.entries()];

    // @witness always r[0][0] = 0, clean
    __assert_taint__(r[0][0], false);
    // @witness __test_taint__('x') => r[0][1] = 'x' tainted
    __assert_taint__(r[0][1], true);
    // @witness always r[1][0] = 1, clean
    __assert_taint__(r[1][0], false);
    // @witness always r[1][1] = 'b', clean
    __assert_taint__(r[1][1], false);
}

__test_taint__(__set_taint__("hello"));
