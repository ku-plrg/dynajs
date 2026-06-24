// @type concolic
// @target es5 Array.prototype.reduce
// @feature builtin reduce

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var s = symbolic.reduce(function (a, v) { return a + v; }, 0);
    // @witness __test_symbolic__([4, 6])
    __IS_SAT__(s === 10, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
