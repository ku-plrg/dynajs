// @type concolic
// @target es5 Array.prototype.reduceRight
// @feature builtin reduceRight
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic.reduceRight(function (a, v) { return a + v; }, 0) === 3) {
    // @witness reduceRight folds the same two elements, so a result of 3 forces element0 + element1 === 3
    __IS_SAT__(symbolic[0] + symbolic[1] !== 3, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
