// @type concolic
// @target es5 Math.min
// @feature builtin min

function __test_symbolic__(symbolic) {
    if (symbolic < 10) {
        // @witness __test_symbolic__(5)
        __IS_SAT__(Math.min(symbolic, 10) < 10, true);
    }
}

__test_symbolic__(__symbolic__('s', 5));
