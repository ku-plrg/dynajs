// @type taint
// @target es5 comma
// @feature syntax comma

function __test_taint__(tainted) {
    var tcm_last_r = (0, tainted);
    // @witness __test_taint__('x') => tcm_last_r = 'x' tainted (comma keeps last)
    __assert_taint__(tcm_last_r, true);
}

__test_taint__(__set_taint__("tv"));
