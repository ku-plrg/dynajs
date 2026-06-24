// @type concolic
// @target es5 global.eval
// @feature builtin eval

function __test_symbolic__(symbolic) {
    if (symbolic < 50) {
        // @witness the symbolic<50 guard excludes 100, the constant eval("100") yields
        __IS_SAT__(symbolic === eval("100"), false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 10));
