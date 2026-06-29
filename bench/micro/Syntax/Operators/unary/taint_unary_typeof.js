// @type taint
// @target es5 unary
// @feature syntax unary
// Numeric unary operators (-, +) carry the operand's taint (the result is a
// data-bearing number). `!x` collapses to a boolean and `typeof x` to a fixed
// type string — concrete, value-independent results — so both are untainted.

function __test_taint__(tainted) {
    // @witness typeof yields a fixed type-name string, not the tainted value => clean
    __assert_taint__(typeof tainted, false);
}

__test_taint__(__set_taint__("secret"));
