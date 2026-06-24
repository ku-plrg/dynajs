// @type concolic
// @target es5 Array.prototype.slice
// @feature builtin slice

function __test_symbolic__(symbolic) {
  if (symbolic.length >= 2) {
    var part = symbolic.slice(0, 2);
    // @witness __test_symbolic__([9, 9])
    __IS_SAT__(part.length === 2, true);
  }
}

__test_symbolic__(__symbolic__('s', [7, 8]));
