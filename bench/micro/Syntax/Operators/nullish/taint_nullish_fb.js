// @type taint
// @target es6+ nullish-optional
// @feature syntax nullish

function __test_taint__(tainted) {
    var tnu_fb_r = null ?? tainted;
    // @witness __test_taint__('x') => null ?? tainted returns tainted = 'x' tainted
    __assert_taint__(tnu_fb_r, true);
}

__test_taint__(__set_taint__("tv"));
