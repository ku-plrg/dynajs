// @type concolic
// @target es2022 Array.prototype.at
// @feature builtin at

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    // @witness __test_symbolic__([1, 2, 9])
    __IS_SAT__(symbolic.at(-1) === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
