// @type taint
// @target es6+ optional-chaining
// @feature syntax optional-chaining

function __test_taint__(tainted) {
    var to_obj = { p: tainted };
    // @witness __test_taint__('x') => to_obj?.p = 'x' tainted
    __assert_taint__(to_obj?.p, true);
}

__test_taint__(__set_taint__("tv"));
