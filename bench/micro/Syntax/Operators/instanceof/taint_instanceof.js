// @type taint
// @target es5 instanceof
// @feature syntax instanceof
// `instanceof` collapses to a boolean (true/false) — a concrete, low-information
// value — so the result is untainted even when the left operand is tainted.

function I_Ctor() {}

function __test_taint__(tainted) {
    __assert_taint__(tainted instanceof I_Ctor, false);
    var io_clean = new I_Ctor();
    __assert_taint__(io_clean instanceof I_Ctor, false);
}

__test_taint__(__set_taint__(new I_Ctor()));
