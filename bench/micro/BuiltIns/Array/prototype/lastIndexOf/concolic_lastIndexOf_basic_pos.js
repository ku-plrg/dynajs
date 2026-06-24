// @type concolic
// @target es5 Array.prototype.lastIndexOf
// @feature builtin lastindexof

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic[1] === 5) {
    // @witness element 1 equals 5, so lastIndexOf(5) is at least index 1 and never below it
    __IS_SAT__(symbolic.lastIndexOf(5) < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 5]));
