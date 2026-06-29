// @type taint
// @target es5 logical
// @feature syntax logical
// && and || return one operand unchanged, so the result's taint is that
// operand's. `!x` collapses to a boolean (a concrete value), so it is untainted.

function __test_taint__(tainted) {
    // @witness logical operator returned the clean operand => clean
    __assert_taint__(tainted || "fallback", false);
}

__test_taint__(__set_taint__(""));
