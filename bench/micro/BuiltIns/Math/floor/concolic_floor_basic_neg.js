// @type concolic
// @target es5 Math.floor
// @feature builtin floor

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness __test_symbolic__(2.5)
        __IS_SAT__(Math.floor(symbolic) < symbolic, true);
    }
}

__test_symbolic__(__symbolic__('s', 2.5));
