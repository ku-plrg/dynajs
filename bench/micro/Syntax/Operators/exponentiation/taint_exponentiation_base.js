// @type taint
// @target es6+ exponentiation
// @feature syntax exponentiation

function __test_taint__(tainted) {
    // @witness __test_taint__(1) => tainted ** 3 = 1 tainted (42 not an integer power)
    __assert_taint__(tainted ** 3, true);
}

__test_taint__(__set_taint__(2));
