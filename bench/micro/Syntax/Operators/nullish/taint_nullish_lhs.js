// @type taint
// @target es6+ nullish-optional
// @feature syntax nullish

function __test_taint__(tainted) {
    var tnu_lhs_r = tainted ?? "x";
    __assert_taint__(tnu_lhs_r, true);
}

__test_taint__(__set_taint__("present"));
