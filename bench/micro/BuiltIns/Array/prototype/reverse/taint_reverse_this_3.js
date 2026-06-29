// @type taint
// @target es6+ Array.prototype.reverse
// @feature builtin array-reverse
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.reverse();
    // @witness __test_taint__('x') => r[2] = 'x' tainted
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("hello"));
