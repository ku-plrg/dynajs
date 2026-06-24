// @type concolic
// @target es5 Array.prototype.map
// @feature builtin map

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.map(function (v) { return v + 1; });
    // @witness __test_symbolic__([4, 0])
    __IS_SAT__(r[0] === 5, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
