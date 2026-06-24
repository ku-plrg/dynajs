// @type concolic
// @target es6+ Math.sign
// @feature builtin sign

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
        // @witness the symbolic > 0 guard forces Math.sign to return exactly 1
        __IS_SAT__(Math.sign(symbolic) !== 1, false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 3));
