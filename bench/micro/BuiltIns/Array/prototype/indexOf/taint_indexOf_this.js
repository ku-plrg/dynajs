// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness __test_taint__('hello') => a.indexOf('hello') = 0 tainted
    __assert_taint__(a.indexOf("hello"), true);
    // @witness index/position, not content => clean
    __assert_taint__(a.indexOf("b"), false);
    // @witness index/position, not content => clean
    __assert_taint__(a.indexOf("c"), false);
    // @witness indexOf returns -1 (not found), clean
    __assert_taint__(a.indexOf("z"), false);
}

__test_taint__(__set_taint__("hello"));
