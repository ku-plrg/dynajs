// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness __test_taint__('x') => a.shift() = 'x' tainted
    __assert_taint__(a.shift(), true);
    // @witness always a.shift() = "b", clean
    __assert_taint__(a.shift(), false);
    // @witness always a.shift() = "c", clean
    __assert_taint__(a.shift(), false);
    var empty = [];
    // @witness a.shift() on empty array = undefined (OOB), clean
    __assert_taint__(empty.shift(), false);
}

__test_taint__(__set_taint__("hello"));
