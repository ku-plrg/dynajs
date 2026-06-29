// @type concolic
// @target es6+ Number.isNaN
// @feature builtin isnan

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness the symbolic > 0 guard excludes NaN (NaN > 0 is false), so Number.isNaN can never be true here
        __IS_SAT__(Number.isNaN(symbolic) === true, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 3));
