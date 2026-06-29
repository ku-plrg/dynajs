// @type taint
// @target es6+ nullish-optional
// @feature syntax nullish

function __test_taint__(tainted) {
    var tnu_obj = { a: { b: tainted } };
    // @witness __test_taint__('x') => obj?.a?.b = 'x' tainted
    __assert_taint__(tnu_obj?.a?.b, true);
}

__test_taint__(__set_taint__("tv"));
