// @type taint
// @target es5 Array.prototype.pop
// @feature builtin array-pop
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", tainted];
    var empty = [];
    // @witness a.pop() on empty array = undefined (OOB), clean
    __assert_taint__(empty.pop(), false);
}

__test_taint__(__set_taint__("hello"));
