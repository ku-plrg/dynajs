// @type concolic
// @target es5 Math.abs
// @feature builtin abs
// @done

function __test_symbolic__(symbolic) {

    if (Math.abs(symbolic) !== symbolic) {
        // @witness symbolic must be negative
        __IS_SAT__(symbolic > 0, false);
    } else {
        __IS_SAT__(true, false);
    }

}

__test_symbolic__(__symbolic__('s',-7));
