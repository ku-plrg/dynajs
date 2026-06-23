// @type taint
// @target es5 ternary
// @feature syntax conditional

function __test_taint__(tainted) {
    var tt_cond_r = tainted ? "a" : "b";
    __assert_taint__(tt_cond_r, false);
}

__test_taint__(__set_taint__(true));
