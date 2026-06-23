// @type taint
// @target es5 bitwise
// @feature syntax bitwise

function __test_taint__(tainted) {
    __assert_taint__(tainted ^ 1, true);
}

__test_taint__(__set_taint__(5));
