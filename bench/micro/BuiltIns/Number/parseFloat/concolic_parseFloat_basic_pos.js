// @type concolic
// @target es6+ Number.parseFloat
// @feature builtin parsefloat

function __test_symbolic__(symbolic) {
    if (symbolic.startsWith("5")) {
        // @witness the startsWith("5") guard means no leading "-" sign, so parseFloat can never yield a negative value
        __IS_SAT__(Number.parseFloat(symbolic) < 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', '5.25abc'));
