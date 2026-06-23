// @type concolic
// @target es6+ Math.trunc
// @feature builtin trunc

function __test_symbolic__(symbolic) {
    if (symbolic >= 0) {
        // @witness toward-zero truncation never exceeds a non-negative input (trunc(x)<=x), NaN excluded by the >=0 guard
        __IS_SAT__(Math.trunc(symbolic) > symbolic, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 4.7));
