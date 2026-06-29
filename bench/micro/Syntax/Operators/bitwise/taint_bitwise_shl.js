// @type taint
// @target es5 bitwise
// @feature syntax bitwise

function __test_taint__(tainted) {
    // @witness __test_taint__(1) => tainted << 4 = 16 tainted
    __assert_taint__(tainted << 4, true);
}

__test_taint__(__set_taint__(1));
