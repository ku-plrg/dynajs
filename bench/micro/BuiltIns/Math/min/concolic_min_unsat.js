// @type concolic
// @target es5 Math.min
// @feature builtin min

function __test_symbolic__(symbolic) {
    if (symbolic >= 10) {
        // @witness the symbolic>=10 guard makes 10 the smaller operand, so min is pinned to 10
        __IS_SAT__(Math.min(symbolic, 10) !== 10, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 10));
