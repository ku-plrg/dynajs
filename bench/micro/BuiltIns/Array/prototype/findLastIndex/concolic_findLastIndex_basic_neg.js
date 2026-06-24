// @type concolic
// @target es2023 Array.prototype.findLastIndex
// @feature builtin findLastIndex

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic[1] < 0) {
    // @witness __test_symbolic__([20, -1])
    __IS_SAT__(symbolic.findLastIndex(function (v) { return v > 10; }) === 0, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, -1]));
