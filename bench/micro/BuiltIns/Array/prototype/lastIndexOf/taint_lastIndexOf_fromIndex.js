// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

function __test_taint__(tainted) {
    var a = ["b", "a", "b", "c"];
    // @witness __test_taint__(2) => a.lastIndexOf("b", tainted) = 2 tainted
    __assert_taint__(a.lastIndexOf("b", tainted), true);
    // @witness lastIndexOf returns -1 (not found), clean
    __assert_taint__(a.lastIndexOf("b", tainted - 12), false);
}

__test_taint__(__set_taint__(2));
