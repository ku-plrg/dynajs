// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation
// Binary `+` on strings concatenates per-character taint: each char of the
// result keeps the taint of the operand char it came from.

// left operand tainted -> its chars tainted in the result, right operand clean

function __test_taint__(tainted) {
    var tsc_rr = "Hello, " + tainted;
    // @witness __test_taint__('x') => r[7..12] tainted from tainted operand
    __assert_taint__(tsc_rr, true);
    // @witness r[0] = 'H' clean literal
    __assert_taint__(tsc_rr[0], false);
    // @witness r[6] = ' ' clean literal
    __assert_taint__(tsc_rr[6], false);
    // @witness __test_taint__('x') => r[7] = 'x' tainted
    __assert_taint__(tsc_rr[7], true);
    // @witness __test_taint__('x') => r[12] = 'x' tainted
    __assert_taint__(tsc_rr[12], true);
}

__test_taint__(__set_taint__("World!"));
