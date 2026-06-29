// @type taint
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_taint__(tainted) {
    // @witness both operands clean, no taint source => clean
    __assert_taint__(2 ** 3, false);
}

__test_taint__(__set_taint__(3));
