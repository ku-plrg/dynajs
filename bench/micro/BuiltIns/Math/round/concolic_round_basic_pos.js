// @type concolic
// @target es5 Math.round
// @feature builtin round

function __test_symbolic__(symbolic) {
    if (symbolic >= 0) {
        // @witness Math.round never exceeds its input by more than 0.5 (half-up ties cap at +0.5)
        __IS_SAT__(Math.round(symbolic) > symbolic + 0.5, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2.5));
