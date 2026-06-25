// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness __test_taint__('x') => a.lastIndexOf('x') = 0 tainted
    __assert_taint__(a.lastIndexOf("hello"), true);
    // @witness index/position, not content => clean
    __assert_taint__(a.lastIndexOf("b"), false);
    // @witness index/position, not content => clean
    __assert_taint__(a.lastIndexOf("c"), false);
    // @witness lastIndexOf returns -1 (not found), clean
    __assert_taint__(a.lastIndexOf("z"), false);
}

__test_taint__(__set_taint__("hello"));
