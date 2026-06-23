// @type concolic
// @target es5 Math.floor
// @feature builtin floor

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness floor never exceeds its input, so floor(x) > x is impossible
        __IS_SAT__(Math.floor(symbolic) > symbolic, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2.5));
