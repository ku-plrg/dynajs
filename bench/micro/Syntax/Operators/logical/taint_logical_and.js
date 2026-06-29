// @type taint
// @target es5 logical
// @feature syntax logical
// && and || return one operand unchanged, so the result's taint is that
// operand's. `!x` collapses to a boolean (a concrete value), so it is untainted.

function __test_taint__(tainted) {
    // @witness __test_taint__('x') => tainted && tainted = 'x' tainted
    __assert_taint__(tainted && tainted, true);
}

__test_taint__(__set_taint__("tv"));
