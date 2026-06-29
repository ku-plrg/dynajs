// @type taint
// @target es6+ bigint
// @feature syntax bigint

function __test_taint__(tainted) {
    // @witness __test_taint__(42n) => 42n * 2n = 84n tainted
    __assert_taint__(tainted * 2n, true);
    // @witness 2n * 3n involves no tainted operand => clean
    __assert_taint__(2n * 3n, false);
}

__test_taint__(__set_taint__(7n));
