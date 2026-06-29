// @type taint
// @target es6+ numeric-separator
// @feature syntax numeric-separator

function __test_taint__(tainted) {
    // @witness __test_taint__(42) => 42 + 1 = 43 tainted
    __assert_taint__(tainted + 1, true);
    // @witness 1_000 + 1 involves no tainted operand, numeric separator is structural => clean
    __assert_taint__(1_000 + 1, false);
}

__test_taint__(__set_taint__(1_000_000));
