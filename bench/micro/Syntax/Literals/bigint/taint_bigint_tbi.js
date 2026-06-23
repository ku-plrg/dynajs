// @type taint
// @target es6+ bigint
// @feature syntax bigint

function __test_taint__(tainted) {
    __assert_taint__(tainted + 1n, true);
}

__test_taint__(__set_taint__(10n));
