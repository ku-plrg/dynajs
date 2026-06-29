// @type concolic
// @target es5 global.parseInt
// @feature builtin parseint

function __test_symbolic__(symbolic) {
    var r = parseInt(symbolic, 10);
    if (!isNaN(r)) {
        // @witness parseInt always returns NaN or an integer, never a fraction
        __IS_SAT__(r % 1 !== 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', "37"));
