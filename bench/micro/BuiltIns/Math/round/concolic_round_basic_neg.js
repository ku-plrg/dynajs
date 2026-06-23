// @type concolic
// @target es5 Math.round
// @feature builtin round

function __test_symbolic__(symbolic) {
    if (symbolic > 10) {
        // @witness __test_symbolic__(10.5)
        __IS_SAT__(Math.round(symbolic) === 11, true);
    }
}

__test_symbolic__(__symbolic__('s', 10.5));
