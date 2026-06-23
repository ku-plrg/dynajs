// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    // @witness includes() with a tainted fromIndex returns a boolean => clean
    __assert_taint__(a.includes("a", tainted), false);
    __assert_taint__(a.includes("c", tainted), false);
}

__test_taint__(__set_taint__(0));
