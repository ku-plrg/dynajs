// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness __test_taint__('x') => a.pop() = 'x' tainted
    __assert_taint__(a.pop(), true);
}

__test_taint__(__set_taint__("hello"));
