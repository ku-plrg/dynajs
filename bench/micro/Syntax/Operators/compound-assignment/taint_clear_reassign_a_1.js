// @type taint
// @target es5 compound-assignment
// @feature syntax clear-reassign
// Reassigning a tainted variable to a clean literal rebinds it to a clean
// value, so the variable's taint is cleared.

function __test_taint__(tainted) {
    // @witness __test_taint__('x') => tainted = 'x' tainted
    __assert_taint__(tainted, true);
}

__test_taint__(__set_taint__("secret"));
