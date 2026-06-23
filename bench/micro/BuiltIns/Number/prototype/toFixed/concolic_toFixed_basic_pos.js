// @type concolic
// @target es5 Number.prototype.toFixed
// @feature builtin tofixed

function __test_symbolic__(symbolic) {
    if (symbolic >= 0) {
        // @witness toFixed(0) rounds to an integer string with zero fractional digits, so no "." can appear
        __IS_SAT__(symbolic.toFixed(0).indexOf(".") !== -1, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 42));
