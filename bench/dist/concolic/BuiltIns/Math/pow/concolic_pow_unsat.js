// @type concolic
// @target es5 Math.pow
// @feature builtin pow

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness a real number squared is never negative
        __IS_SAT__(Math.pow(symbolic, 2) < 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
