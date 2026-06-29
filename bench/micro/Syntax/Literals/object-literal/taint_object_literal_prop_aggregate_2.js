// @type taint
// @target es5 object-literal
// @feature syntax object-prop-taint

function __test_taint__(tainted) {
    // single-prop object: its only property is tainted => whole object tainted
    var tol_x2 = {test: tainted};
    // @witness __test_taint__('x') => tol_x2 = {test:'x'} tainted (all props tainted)
    __assert_taint__(tol_x2, true);
}

__test_taint__(__set_taint__("Hello"));
