// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation

function __test_taint__(tainted) {
    // both operands tainted => every result char tracks a tainted source
    var tsp_a = tainted + tainted;
    // @witness __test_taint__("x") => tsp_a[0] = 'x' tainted
    __assert_taint__(tsp_a[0], true);
}

__test_taint__(__set_taint__("h"));
