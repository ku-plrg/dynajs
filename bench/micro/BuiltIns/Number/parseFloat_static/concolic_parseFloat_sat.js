// @type concolic
// @target es6+ Number.parseFloat
// @feature builtin parsefloat

function __test_symbolic__(symbolic) {
    if (symbolic.startsWith("-")) {
        // @witness __test_symbolic__("-7.5")
        __IS_SAT__(Number.parseFloat(symbolic) < 0, true);
    }
}

__test_symbolic__(__symbolic__('s', '-7.5'));
