// @type taint
// @target es6+ bigint
// @feature syntax bigint
// @done

function __test_taint__(tainted) {
    // @witness __test_taint__(41n) => 41n + 1n = 42n tainted
    __assert_taint__(tainted + 1n, true);
}

__test_taint__(__set_taint__(10n));
