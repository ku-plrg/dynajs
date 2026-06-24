// @type concolic
// @target es5 Array.prototype.reduceRight
// @feature builtin reduceRight

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var s = symbolic.reduceRight(function (a, v) { return a + v; }, 0);
    // @witness reduceRight folds the same elements, so the sum still equals element0 + element1
    __IS_SAT__(s !== symbolic[0] + symbolic[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
