// @type taint
// @target es5 throw
// @feature syntax throw

function __test_taint__(tainted) {
    var tt_t;
    try {
      throw tainted;
    } catch (e) {
      tt_t = e;
    }
    // @witness __test_taint__('x') => thrown tainted value caught => e tainted
    __assert_taint__(tt_t, true);
}

__test_taint__(__set_taint__("tv"));
