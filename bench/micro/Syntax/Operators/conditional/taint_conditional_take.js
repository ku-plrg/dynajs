// @type taint
// @target es5 ternary
// @feature syntax conditional

function __test_taint__(tainted) {
    var tt_take_r = true ? tainted : "x";
    __assert_taint__(tt_take_r, true);
}

__test_taint__(__set_taint__("tv"));
