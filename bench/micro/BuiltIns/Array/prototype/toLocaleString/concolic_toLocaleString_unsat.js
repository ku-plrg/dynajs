// @type concolic
// @target es5 Array.prototype.toLocaleString
// @feature builtin toLocaleString

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var s = symbolic.toLocaleString();
    // @witness two elements join with a list separator, so the comma is always present
    __IS_SAT__(!s.includes(","), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
