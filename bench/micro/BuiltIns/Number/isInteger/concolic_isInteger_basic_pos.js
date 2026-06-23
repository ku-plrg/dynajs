// @type concolic
// @target es6+ Number.isInteger
// @feature builtin isinteger

function __test_symbolic__(symbolic) {
    if (Number.isInteger(symbolic)) {
        // @witness isInteger(x) holds means x has no fractional part, so floor(x) !== x is impossible
        __IS_SAT__(Math.floor(symbolic) !== symbolic, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
