// @type concolic
// @target es6+ Array.prototype.find
// @feature builtin find

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    // @witness __test_symbolic__([20, 0])
    __IS_SAT__(symbolic.find(function (v) { return v > 10; }) === 20, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
