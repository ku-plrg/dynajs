// @type taint
// @target es5 instanceof
// @feature syntax instanceof
// `instanceof` collapses to a boolean (true/false) — a concrete, low-information
// value — so the result is untainted even when the left operand is tainted.

function I_Ctor() {}

function __test_taint__(tainted) {
    var io_clean = new I_Ctor();
    // @witness boolean result, clean
    __assert_taint__(io_clean instanceof I_Ctor, false);
}

__test_taint__(__set_taint__(new I_Ctor()));
