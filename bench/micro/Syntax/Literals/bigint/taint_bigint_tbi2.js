// @type taint
// @target es6+ bigint
// @feature syntax bigint

function __test_taint__(tainted) {
    __assert_taint__(tainted * 2n, true);
    __assert_taint__(2n * 3n, false);
}

__test_taint__(__set_taint__(7n));
