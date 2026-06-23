// @type taint
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_taint__(tainted) {
    __assert_taint__(tainted ** 3, true);
}

__test_taint__(__set_taint__(2));
