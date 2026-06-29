// @type taint
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_taint__(tainted) {
    // @witness __test_taint__(3) => 2 ** tainted = 8 tainted
    __assert_taint__(2 ** tainted, true);
    // @witness both operands clean, no taint source => clean
    __assert_taint__(2 ** 3, false);
}

__test_taint__(__set_taint__(3));
