// @type taint
// @target es5 Array.prototype.lastIndexOf
// @feature builtin array-lastIndexOf

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness lastIndexOf locating tainted "x" yields a tainted index
    __assert_taint__(a.lastIndexOf("hello"), true);
    __assert_taint__(a.lastIndexOf("b"), false);
    __assert_taint__(a.lastIndexOf("c"), false);
    __assert_taint__(a.lastIndexOf("z"), false);
}

__test_taint__(__set_taint__("hello"));
