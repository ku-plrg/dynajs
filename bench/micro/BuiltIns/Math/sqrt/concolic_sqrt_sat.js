// @type concolic
// @target es5 Math.sqrt
// @feature builtin sqrt

function __test_symbolic__(symbolic) {
    if (symbolic > 0 && symbolic < 1) {
        var r = Math.sqrt(symbolic);
        // @witness __test_symbolic__(0.25)
        __IS_SAT__(r > symbolic, true);
    }
}

__test_symbolic__(__symbolic__('s', 0.25));
