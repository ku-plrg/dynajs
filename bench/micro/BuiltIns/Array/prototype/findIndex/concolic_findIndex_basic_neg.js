// @type concolic
// @target es6+ Array.prototype.findIndex
// @feature builtin findIndex

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic[0] < 0) {
    // @witness __test_symbolic__([-1, 20])
    __IS_SAT__(symbolic.findIndex(function (v) { return v > 10; }) === 1, true);
  }
}

__test_symbolic__(__symbolic__('s', [-1, 0]));
