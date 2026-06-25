// @type concolic
// @target es5 Array.prototype.sort
// @feature builtin sort
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.sort(function (a, b) { return a - b; }).length === 2) {
    // @witness sort orders ascending in place, so after sorting index 0 is never greater than index 1
    __IS_SAT__(symbolic[0] > symbolic[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [2, 1]));
