// @type concolic
// @target es5 global.eval
// @feature builtin eval

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness __test_symbolic__(42)
        __IS_SAT__(symbolic === eval("40+2"), true);
    }
}

__test_symbolic__(__symbolic__('s', 42));
