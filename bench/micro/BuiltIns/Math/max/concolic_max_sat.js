// @type concolic
// @target es5 Math.max
// @feature builtin max

function __test_symbolic__(symbolic) {
    if (symbolic < 5) {
        // @witness __test_symbolic__(3)
        __IS_SAT__(Math.max(symbolic, 5) === 5, true);
    }
}

__test_symbolic__(__symbolic__('s', 3));
