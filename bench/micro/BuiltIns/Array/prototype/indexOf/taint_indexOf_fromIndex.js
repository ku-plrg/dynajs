// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "b"];
    // @witness __test_taint__(1) => a.indexOf("b", tainted) = 1 tainted
    __assert_taint__(a.indexOf("b", tainted), true);
    // @witness indexOf returns -1 (not found), clean
    __assert_taint__(a.indexOf("b", tainted + 9), false);
}

__test_taint__(__set_taint__(1));
