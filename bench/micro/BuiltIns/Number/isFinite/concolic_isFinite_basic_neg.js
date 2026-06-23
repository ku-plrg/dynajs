// @type concolic
// @target es6+ Number.isFinite
// @feature builtin isfinite

function __test_symbolic__(symbolic) {
    if (symbolic > 1e308) {
        // @witness __test_symbolic__(1.5e308)
        __IS_SAT__(!Number.isFinite(symbolic + symbolic), true);
    }
}

__test_symbolic__(__symbolic__('s', 1.5e308));
