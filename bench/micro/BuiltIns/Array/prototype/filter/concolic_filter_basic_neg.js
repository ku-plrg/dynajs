// @type concolic
// @target es5 Array.prototype.filter
// @feature builtin filter

function __test_symbolic__(symbolic) {
  if (symbolic[0] > 0) {
    var r = symbolic.filter(function (v) { return v > 0; });
    // @witness __test_symbolic__([5, -1, -2])
    __IS_SAT__(r.length === 1, true);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
