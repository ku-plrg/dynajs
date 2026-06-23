// @type concolic
// @target es5 global.parseFloat
// @feature builtin parsefloat

function __test_symbolic__(symbolic) {
    var n = parseFloat(symbolic);
    if (n > 10) {
        // @witness the n > 10 guard means parseFloat returned a real number, so it can never be NaN
        __IS_SAT__(isNaN(n), false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', '42abc'));
