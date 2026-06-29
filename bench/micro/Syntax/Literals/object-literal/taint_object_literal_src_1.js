// @type taint
// @target es5 object-literal
// @feature syntax object-literal

function __test_taint__(tainted) {
    var tol_obj = { a: tainted, b: "clean" };
    // @witness __test_taint__("x") => tol_obj.a = "x" tainted
    __assert_taint__(tol_obj.a, true);
}

__test_taint__(__set_taint__("tv"));
