// @type taint
// @target es6+ numeric-separator
// @feature syntax numeric-separator

function __test_taint__(tainted) {
    __assert_taint__(tainted + 1, true);
    __assert_taint__(1_000 + 1, false);
}

__test_taint__(__set_taint__(1_000_000));
