// @type concolic
// @target es2023 Array.prototype.toSorted
// @feature builtin toSorted

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.toSorted(function (a, b) { return a - b; });
    // @witness toSorted returns an ascending copy, so its index 0 is never greater than index 1
    __IS_SAT__(r[0] > r[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [2, 1]));
