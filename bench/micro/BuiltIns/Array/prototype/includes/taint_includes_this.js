// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness includes() returns a boolean => clean even when "x" is present
    __assert_taint__(a.includes("hello"), false);
    __assert_taint__(a.includes("b"), false);
    __assert_taint__(a.includes("z"), false);
}

__test_taint__(__set_taint__("hello"));
