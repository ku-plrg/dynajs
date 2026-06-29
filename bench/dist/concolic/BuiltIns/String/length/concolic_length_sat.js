// @type concolic
// @target es5 String length
// @feature builtin length

function __test_symbolic__(symbolic) {
    if (symbolic.length >= 3) {
        // @witness __test_symbolic__("xyzw")
        __IS_SAT__(symbolic.length !== 3, true);
    }
}

__test_symbolic__(__symbolic__('s', "hello"));
