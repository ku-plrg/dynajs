// @type concolic
// @target es5 global.isNaN
// @feature builtin isnan

function __test_symbolic__(symbolic) {
    if (!isNaN(symbolic)) {
        // @witness isNaN(x) false means ToNumber(x) is a real number, which is self-equal
        __IS_SAT__(symbolic !== symbolic, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
