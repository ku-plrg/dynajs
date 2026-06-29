// @type taint
// @target es5 compound-assignment
// @feature syntax clear-reassign
// Reassigning a tainted variable to a clean literal rebinds it to a clean
// value, so the variable's taint is cleared.

function __test_taint__(tainted) {
    tainted = "Test";
    // @witness tainted reassigned to clean literal before read => clean
    __assert_taint__(tainted, false);
}

__test_taint__(__set_taint__("Test"));
