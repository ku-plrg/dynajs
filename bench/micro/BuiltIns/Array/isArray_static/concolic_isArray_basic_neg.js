// @type concolic
// @target es5 Array.isArray
// @feature builtin isArray

function __test_symbolic__(symbolic) {
  if (symbolic.length === 1) {
    // @witness __test_symbolic__([7])
    __IS_SAT__(Array.isArray(symbolic) && symbolic[0] === 7, true);
  }
}

__test_symbolic__(__symbolic__('s', [3]));
