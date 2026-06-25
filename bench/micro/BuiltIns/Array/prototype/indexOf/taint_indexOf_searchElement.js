// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

function __test_taint__(tainted) {
    var a = ["a", "hello", "c"];
    // @witness __test_taint__('x') => ["a","x","c"].indexOf("x") = 1, found index tainted
    __assert_taint__(a.indexOf(tainted), true);
    // @witness indexOf returns -1 (not found), clean
    __assert_taint__(a.indexOf(tainted + "z"), false);
}

__test_taint__(__set_taint__("hello"));
