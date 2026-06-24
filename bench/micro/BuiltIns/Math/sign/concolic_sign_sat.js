// @type concolic
// @target es6+ Math.sign
// @feature builtin sign

function __test_symbolic__(symbolic) {
    if (symbolic < 0) {
        // @witness __test_symbolic__(-3)
        __IS_SAT__(Math.sign(symbolic) === -1, true);
    }
}

__test_symbolic__(__symbolic__('s', -3));
