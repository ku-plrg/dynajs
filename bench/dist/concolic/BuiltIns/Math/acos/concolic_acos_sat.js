// @type concolic
// @target es5 Math.acos
// @feature builtin acos

function __test_symbolic__(symbolic) {
    if (symbolic <= 1) {
        // @witness __test_symbolic__(0)
        __IS_SAT__(Math.acos(symbolic) > 1, true);
    }
}

__test_symbolic__(__symbolic__('s', 0));
