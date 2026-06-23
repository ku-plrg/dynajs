// @type taint
// @target es5 bitwise
// @feature syntax bitwise

function __test_taint__(tainted) {
    __assert_taint__(~tainted, true);
    __assert_taint__(0xff & 0x0f, false);
}

__test_taint__(__set_taint__(5));
