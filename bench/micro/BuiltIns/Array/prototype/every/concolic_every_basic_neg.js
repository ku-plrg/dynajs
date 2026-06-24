// @type concolic
// @target es5 Array.prototype.every
// @feature builtin every

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    // @witness __test_symbolic__([1, 2])
    __IS_SAT__(symbolic.every(function (v) { return v > 0; }), true);
  }
}

__test_symbolic__(__symbolic__('s', [1, -1]));
