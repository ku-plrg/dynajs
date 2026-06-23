// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation

function __test_taint__(tainted) {
    // both operands tainted => every result char tracks a tainted source
    var tsp_a = tainted + tainted;
    // @witness __test_taint__('h') => a[0]='h' (left operand)
    __assert_taint__(tsp_a[0], true);
    // @witness __test_taint__('h') => a[1]='h' (right operand)
    __assert_taint__(tsp_a[1], true);
    // @witness every char tainted => whole string tainted
    __assert_taint__(tsp_a, true);
}

__test_taint__(__set_taint__("h"));
