// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness indexOf locating tainted "x" yields a tainted index
    __assert_taint__(a.indexOf("hello"), true);
    __assert_taint__(a.indexOf("b"), false);
    __assert_taint__(a.indexOf("c"), false);
    __assert_taint__(a.indexOf("z"), false);
}

__test_taint__(__set_taint__("hello"));
