// @type concolic
// @target es6+ Array.prototype.includes
// @feature builtin includes

function __test_symbolic__(symbolic) {

  if (symbolic.includes(7)) {
    // @witness __test_symbolic__([7])
    __IS_SAT__(!(symbolic.includes(99)), true);
  }

}

__test_symbolic__(__symbolic__('s', [7]));
