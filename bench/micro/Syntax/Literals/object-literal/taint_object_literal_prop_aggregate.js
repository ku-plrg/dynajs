// @type taint
// @target es5 object-literal
// @feature syntax object-prop-taint

function __test_taint__(tainted) {
    // single-prop object: its only property is tainted => whole object tainted
    var tol_x2 = {test: tainted};
    __assert_taint__(tol_x2.test, true);
    // @witness all (one) props tainted => whole tainted
    __assert_taint__(tol_x2, true);

    // multi-prop object, one tainted => mixed => whole clean
    var tol_x3 = {test1: tainted, test2: "clean"};
    __assert_taint__(tol_x3.test1, true);
    __assert_taint__(tol_x3.test2, false);
    // @witness mixed props => not all-tainted => clean
    __assert_taint__(tol_x3, false);
}

__test_taint__(__set_taint__("Hello"));
