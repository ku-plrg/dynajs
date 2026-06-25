// @type concolic
// @target es6+ Array.prototype.findIndex
// @feature builtin findIndex
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.findIndex(function (v) { return v > 10; }) === 0) {
    // @witness findIndex === 0 means index 0 is the first match, so symbolic[0] > 10
    __IS_SAT__(symbolic[0] <= 10, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [11]));
