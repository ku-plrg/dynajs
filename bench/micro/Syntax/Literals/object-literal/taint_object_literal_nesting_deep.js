// @type taint
// @target es5 object-literal
// @feature syntax object-nesting

function __test_taint__(tainted) {
    // tainted = leaf value; only the deepest field is the source
    var tol_a = {b: {c: tainted, d: 0}, e: 0};
    // @witness leaf value tainted
    __assert_taint__(tol_a.b.c, true);
    // @witness mid-level object has a clean sibling => not all-tainted => clean
    __assert_taint__(tol_a.b, false);
    // @witness outer container also not all-tainted => clean
    __assert_taint__(tol_a, false);
}

__test_taint__(__set_taint__(1));
