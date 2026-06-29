// @type taint
// @target es5 unary
// @feature syntax unary
// Numeric unary operators (-, +) carry the operand's taint (the result is a
// data-bearing number). `!x` collapses to a boolean and `typeof x` to a fixed
// type string — concrete, value-independent results — so both are untainted.

function __test_taint__(tainted) {
    // @witness __test_taint__(-42) => -tainted = 42 tainted
    __assert_taint__(-tainted, true);
}

__test_taint__(__set_taint__(5));
