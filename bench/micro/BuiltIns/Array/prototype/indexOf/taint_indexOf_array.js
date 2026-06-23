// @type taint
// @target es5 Array.prototype.indexOf
// @feature builtin array-indexOf

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r1 = tainted.indexOf("x");
    // @witness always indexOf returns position number => clean
    __assert_taint__(r1, false);
    var r2 = tainted.indexOf("zzz");
    // @witness always indexOf("zzz") = -1, not-found position => clean
    __assert_taint__(r2, false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));
