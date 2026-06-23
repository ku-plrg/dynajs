// @type concolic
// @target es5 Math.sqrt
// @feature builtin sqrt

function __test_symbolic__(symbolic) {
    if (symbolic >= 0) {
        var r = Math.sqrt(symbolic);
        // @witness Math.sqrt of a non-negative input is always >= 0
        __IS_SAT__(r < 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 4));
