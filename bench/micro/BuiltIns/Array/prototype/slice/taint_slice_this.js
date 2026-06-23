// @type taint
// @target es6+ Array.prototype.slice
// @feature builtin array-slice

function __test_taint__(tainted) {
    var a = ["a", "b", tainted, "d"];
    var r = a.slice(1, 3);
    // @witness slice keeps tainted "x" (originally index 2) at result [1]
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__("hello"));
