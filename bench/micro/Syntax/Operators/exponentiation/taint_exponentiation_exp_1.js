// @type taint
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_taint__(tainted) {
    // @witness __test_taint__(0) => 2 ** tainted = 1 tainted (42 not a power of 2)
    __assert_taint__(2 ** tainted, true);
}

__test_taint__(__set_taint__(3));
