// @type concolic
// @target es5 Array.prototype.toString
// @feature builtin toString

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var s = symbolic.toString();
    // @witness toString joins two elements with a comma, so the comma is always present
    __IS_SAT__(!s.includes(","), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
