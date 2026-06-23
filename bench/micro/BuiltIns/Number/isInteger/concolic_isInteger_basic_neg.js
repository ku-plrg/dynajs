// @type concolic
// @target es6+ Number.isInteger
// @feature builtin isinteger

function __test_symbolic__(symbolic) {
    if (symbolic > 10) {
        // @witness __test_symbolic__(10.5)
        __IS_SAT__(Number.isInteger(symbolic) === false, true);
    }
}

__test_symbolic__(__symbolic__('s', 11.5));
