// @type concolic
// @target es5 Math.ceil
// @feature builtin ceil

function __test_symbolic__(symbolic) {
    if (symbolic > 5) {
        // @witness __test_symbolic__(5.5)
        __IS_SAT__(Math.ceil(symbolic) > symbolic, true);
    }
}

__test_symbolic__(__symbolic__('s', 5.5));
