// @type concolic
// @target es6+ Array.prototype.findIndex
// @feature builtin findIndex

function __test_symbolic__(symbolic) {
  if (symbolic[0] > 10) {
    // @witness element 0 matches, so findIndex returns 0
    __IS_SAT__(symbolic.findIndex(function (v) { return v > 10; }) !== 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [11]));
