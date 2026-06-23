// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    // @witness __test_taint__('hello') => a.pop() = 'hello' tainted
    __assert_taint__(a.pop(), true);
    // @witness always a.pop() = "b", clean
    __assert_taint__(a.pop(), false);
    // @witness always a.pop() = "a", clean
    __assert_taint__(a.pop(), false);
    var empty = [];
    // @witness a.pop() on empty array = undefined (OOB), clean
    __assert_taint__(empty.pop(), false);
}

__test_taint__(__set_taint__("hello"));
