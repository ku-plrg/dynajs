// @type concolic
// @target es2019 Array.prototype.flatMap
// @feature builtin flatMap

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.flatMap(function (v) { return [v]; });
    // @witness __test_symbolic__([9, 0])
    __IS_SAT__(r[0] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
