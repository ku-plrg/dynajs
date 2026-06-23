// @type concolic
// @target es5 Math.acos
// @feature builtin acos

function __test_symbolic__(symbolic) {
    if (symbolic >= -1 && symbolic <= 1) {
        // @witness acos range over [-1,1] is [0, PI], so the result is never negative
        __IS_SAT__(Math.acos(symbolic) < 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 0.5));
