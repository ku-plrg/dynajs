// @type concolic
// @target es5 Math.pow
// @feature builtin pow

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness __test_symbolic__(3)
        __IS_SAT__(Math.pow(symbolic, 2) === 9, true);
    }
}

__test_symbolic__(__symbolic__('s', 5));
