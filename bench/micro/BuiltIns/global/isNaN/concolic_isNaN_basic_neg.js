// @type concolic
// @target es5 global.isNaN
// @feature builtin isnan

function __test_symbolic__(symbolic) {
    if (!(symbolic > 1000)) {
        // @witness __test_symbolic__(NaN)
        __IS_SAT__(isNaN(symbolic), true);
    }
}

__test_symbolic__(__symbolic__('s', 5));
