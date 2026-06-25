// @type concolic
// @target es6+ Array.prototype.findLast
// @feature builtin findLast
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic.findLast(function (v) { return v > 10; }) === symbolic[1]) {
    // @witness findLast returns the last match; equal to symbolic[1] means symbolic[1] > 10
    __IS_SAT__(symbolic[1] <= 10, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 11]));
