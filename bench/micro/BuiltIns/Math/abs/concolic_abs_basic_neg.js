// @type concolic
// @target es5 Math.abs
// @feature builtin abs

function __test_symbolic__(symbolic) {
    if (symbolic < 0) {
        // @witness __test_symbolic__(-5)
        __IS_SAT__(Math.abs(symbolic) !== symbolic, true);
    }
}

__test_symbolic__(__symbolic__('s', -5));
