// @type taint
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_taint__(tainted) {
    __assert_taint__(2 ** tainted, true);
    __assert_taint__(2 ** 3, false);
}

__test_taint__(__set_taint__(3));
