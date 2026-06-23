// @type concolic
// @target es6+ Number.isFinite
// @feature builtin isfinite

function __test_symbolic__(symbolic) {
    if (Number.isFinite(symbolic)) {
        // @witness isFinite guard forces a finite value, so symbolic - symbolic is exactly 0
        __IS_SAT__((symbolic - symbolic) !== 0, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 42));
