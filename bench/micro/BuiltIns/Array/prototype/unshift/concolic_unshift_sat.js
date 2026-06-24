// @type concolic
// @target es5 Array.prototype.unshift
// @feature builtin unshift

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    symbolic.unshift(9);
    // @witness __test_symbolic__([4, 2])
    __IS_SAT__(symbolic[1] === 4, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
