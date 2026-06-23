// @type concolic
// @target es5 Math.ceil
// @feature builtin ceil

function __test_symbolic__(symbolic) {
    if (symbolic > 5) {
        // @witness Math.ceil is the least integer >= x, so ceil(x) < x is impossible
        __IS_SAT__(Math.ceil(symbolic) < symbolic, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5.5));
