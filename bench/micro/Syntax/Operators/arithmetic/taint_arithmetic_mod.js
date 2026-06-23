// @type taint
// @target es5 arithmetic
// @feature syntax arithmetic

function __test_taint__(tainted) {
    __assert_taint__(tainted % 3, true);
    __assert_taint__(2 + 3, false);
}

__test_taint__(__set_taint__(10));
