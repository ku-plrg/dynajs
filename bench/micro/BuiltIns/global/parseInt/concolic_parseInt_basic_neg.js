// @type concolic
// @target es5 global.parseInt
// @feature builtin parseint

function __test_symbolic__(symbolic) {
    if (symbolic.length >= 3) {
        // @witness __test_symbolic__("42abc")
        __IS_SAT__(parseInt(symbolic, 10) === 42, true);
    }
}

__test_symbolic__(__symbolic__('s', "42z"));
