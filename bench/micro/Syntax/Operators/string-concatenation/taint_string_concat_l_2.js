// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation
// Binary `+` on strings concatenates per-character taint: each char of the
// result keeps the taint of the operand char it came from.

// left operand tainted -> its chars tainted in the result, right operand clean

function __test_taint__(tainted) {
    var tsc_lr = tainted + "World!";
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(tsc_lr[0], true);
}

__test_taint__(__set_taint__("Hello, "));
