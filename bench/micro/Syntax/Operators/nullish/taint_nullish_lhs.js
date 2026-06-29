// @type taint
// @target es6+ nullish-optional
// @feature syntax nullish

function __test_taint__(tainted) {
    var tnu_lhs_r = tainted ?? "x";
    // @witness __test_taint__('x') => tainted ?? 'x' returns tainted lhs = 'x' tainted
    __assert_taint__(tnu_lhs_r, true);
}

__test_taint__(__set_taint__("present"));
