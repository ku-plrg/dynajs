// @type concolic
// @target es6+ Number.isNaN
// @feature builtin isnan

function __test_symbolic__(symbolic) {
    // @witness __test_symbolic__(5)
    __IS_SAT__(Number.isNaN(symbolic) === false, true);
}

__test_symbolic__(__symbolic__('s', 3));
