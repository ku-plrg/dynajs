// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness pop returns the tainted element "x"
    __assert_taint__(a.pop(), true);
    // @witness pop returns a clean element
    __assert_taint__(a.pop(), false);
    __assert_taint__(a.pop(), false);
    var empty = [];
    // @witness pop on empty array => undefined, clean
    __assert_taint__(empty.pop(), false);
}

__test_taint__(__set_taint__("hello"));
