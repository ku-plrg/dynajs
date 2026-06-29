// @type taint
// @target es5 bitwise
// @feature syntax bitwise

function __test_taint__(tainted) {
    // @witness __test_taint__(-43) => ~tainted = 42 tainted
    __assert_taint__(~tainted, true);
}

__test_taint__(__set_taint__(5));
