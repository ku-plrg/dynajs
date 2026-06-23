// @type taint
// @target es5 increment-decrement
// @feature syntax increment-decrement

function __test_taint__(tainted) {
    var ti_clean = 5;
    ti_clean++;
    __assert_taint__(ti_clean, false);
}

__test_taint__(__set_taint__("x"));
