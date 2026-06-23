// @type concolic
// @target es5 Math.abs
// @feature builtin abs

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness Math.abs never yields a negative result, so abs<0 is impossible
        __IS_SAT__(Math.abs(symbolic) < 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
