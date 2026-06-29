// @type taint
// @target es5 object-literal
// @feature syntax object-literal

function __test_taint__(tainted) {
    var tol_short = { tol_v: tainted };
    // @witness __test_taint__("x") => tol_short.tol_v = "x" tainted
    __assert_taint__(tol_short.tol_v, true);
}

__test_taint__(__set_taint__("tv"));
