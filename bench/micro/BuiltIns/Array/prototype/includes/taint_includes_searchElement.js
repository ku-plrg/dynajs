// @type taint
// @target es6+ Array.prototype.includes
// @feature builtin array-includes

function __test_taint__(tainted) {
    var a = ["a", "hello", "c"];
    // @witness includes() with a tainted search element returns a boolean => clean
    __assert_taint__(a.includes(tainted), false);
}

__test_taint__(__set_taint__("hello"));
