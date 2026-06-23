// @type taint
// @target es5 object-literal
// @feature syntax object-nesting

function __test_taint__(tainted) {
    // tainted = {c:1}; only the inner object is the source (taint flows down, not up)
    var tol_a = {b: tainted, d: 0};
    // @witness inner-only taint => outer not all-tainted => clean
    __assert_taint__(tol_a, false);
    // @witness the tainted inner object
    __assert_taint__(tol_a.b, true);
    // @witness value inside the tainted inner object (coarse down)
    __assert_taint__(tol_a.b.c, true);
}

__test_taint__(__set_taint__({c: 1}));
