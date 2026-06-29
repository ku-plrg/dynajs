// @type taint
// @target es5 bitwise
// @feature syntax bitwise

function __test_taint__(tainted) {
    // @witness __test_taint__(0xff) => tainted & 0x0f = 15 tainted
    __assert_taint__(tainted & 0x0f, true);
}

__test_taint__(__set_taint__(0xff));
