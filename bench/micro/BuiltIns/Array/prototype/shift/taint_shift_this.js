// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness shift returns the tainted element "x"
    __assert_taint__(a.shift(), true);
    // @witness shift returns a clean element
    __assert_taint__(a.shift(), false);
    __assert_taint__(a.shift(), false);
    var empty = [];
    // @witness shift on empty array => undefined, clean
    __assert_taint__(empty.shift(), false);
}

__test_taint__(__set_taint__("hello"));
