// @type concolic
// @target es5 Array.prototype.reduceRight
// @feature builtin reduceRight

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var s = symbolic.reduceRight(function (a, v) { return a + v; }, 0);
    // @witness __test_symbolic__([3, 7])
    __IS_SAT__(s === 10, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
