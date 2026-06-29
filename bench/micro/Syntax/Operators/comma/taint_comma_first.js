// @type taint
// @target es5 comma
// @feature syntax comma

function __test_taint__(tainted) {
    var tcm_first_r = (tainted, "clean");
    // @witness tainted operand discarded (comma keeps last) => clean
    __assert_taint__(tcm_first_r, false);
}

__test_taint__(__set_taint__("tv"));
