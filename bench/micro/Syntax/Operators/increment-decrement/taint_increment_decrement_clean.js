// @type taint
// @target es5 increment-decrement
// @feature syntax increment-decrement

function __test_taint__(tainted) {
    var ti_clean = 5;
    ti_clean++;
    // @witness ti_clean is a plain number, never touched tainted => clean
    __assert_taint__(ti_clean, false);
}

__test_taint__(__set_taint__("x"));
