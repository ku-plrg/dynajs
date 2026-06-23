// @type taint
// @target es5 equality
// @feature syntax equality
// An equality test collapses to a boolean (true/false) — a concrete,
// low-information value — so the result is untainted even with a tainted operand.

function __test_taint__(tainted) {
    __assert_taint__(tainted !== 9, false);
    __assert_taint__(1 === 1, false);
}

__test_taint__(__set_taint__(5));
