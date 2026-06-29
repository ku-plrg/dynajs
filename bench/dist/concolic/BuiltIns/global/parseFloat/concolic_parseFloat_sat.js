// @type concolic
// @target es5 global.parseFloat
// @feature builtin parsefloat

function __test_symbolic__(symbolic) {
    if (symbolic.length > 0) {
        var n = parseFloat(symbolic);
        // @witness __test_symbolic__("3.5")
        __IS_SAT__(!isNaN(n) && n < 5, true);
    }
}

__test_symbolic__(__symbolic__('s', '3.14abc'));
