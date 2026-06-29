// @type taint
// @target es5 object-literal
// @feature syntax object-literal

function __test_taint__(tainted) {
    var tol_obj = { a: tainted, b: "clean" };
    // @witness clean literal prop, clean
    __assert_taint__(tol_obj.b, false);
}

__test_taint__(__set_taint__("tv"));
