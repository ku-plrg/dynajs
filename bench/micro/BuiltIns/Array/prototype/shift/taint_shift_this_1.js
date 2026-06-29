// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness __test_taint__('x') => a.shift() = 'x' tainted
    __assert_taint__(a.shift(), true);
}

__test_taint__(__set_taint__("hello"));
