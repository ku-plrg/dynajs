// @type taint
// @target es5 ternary
// @feature syntax conditional

function __test_taint__(tainted) {
    var tt_skip_r = false ? tainted : "clean";
    // @witness tainted branch not taken, result is clean literal => clean
    __assert_taint__(tt_skip_r, false);
}

__test_taint__(__set_taint__("tv"));
