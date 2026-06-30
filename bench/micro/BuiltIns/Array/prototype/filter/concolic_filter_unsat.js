// @type concolic
// @target es5 Array.prototype.filter
// @feature builtin filter
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.filter(function (v) { return v > 0; }).length === 2) {
    // @witness filter returns a subsequence, so a result of length 2 forces the source to hold at least 2 elements
    __IS_SAT__(symbolic.length < 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
