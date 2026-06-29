// @type taint
// @target es6+ numeric-separator
// @feature syntax numeric-separator

function __test_taint__(tainted) {
    // @witness __test_taint__(42) => 42 + 1 = 43 tainted
    __assert_taint__(tainted + 1, true);
}

__test_taint__(__set_taint__(1_000_000));
