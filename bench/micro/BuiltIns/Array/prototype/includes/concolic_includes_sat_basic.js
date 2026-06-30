// @type concolic
// @target es6+ Array.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([7])
  __IS_SAT__(symbolic.includes(7), true);

}

__test_symbolic__(__symbolic__('s', [1]));
