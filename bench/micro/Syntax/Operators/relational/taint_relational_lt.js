// @type taint
// @target es5 relational
// @feature syntax relational
// A relational comparison collapses to a boolean (true/false) — a concrete,
// low-information value — so the result is untainted even with a tainted operand.

function __test_taint__(tainted) {
    // @witness boolean result, clean
    __assert_taint__(tainted < 10, false);
}

__test_taint__(__set_taint__(5));
