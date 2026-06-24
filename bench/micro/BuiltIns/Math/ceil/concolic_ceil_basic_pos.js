// @type concolic
// @target es5 Math.ceil
// @feature builtin ceil
// @done

function __test_symbolic__(symbolic) {
    if (Math.ceil(symbolic) >= 5) {
        __IS_SAT__(symbolic < 5, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5.5));
