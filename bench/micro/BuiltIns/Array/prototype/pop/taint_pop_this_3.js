// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness always a.pop() = "a", clean
    __assert_taint__(a.pop(), false);
}

__test_taint__(__set_taint__("hello"));
