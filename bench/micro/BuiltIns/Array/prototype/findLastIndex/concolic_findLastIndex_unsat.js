// @type concolic
// @target es6+ Array.prototype.findLastIndex
// @feature builtin findLastIndex
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic.findLastIndex(function (v) { return v > 10; }) === 1) {
    // @witness findLastIndex === 1 means index 1 is the last match, so symbolic[1] > 10
    __IS_SAT__(symbolic[1] <= 10, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 11]));
