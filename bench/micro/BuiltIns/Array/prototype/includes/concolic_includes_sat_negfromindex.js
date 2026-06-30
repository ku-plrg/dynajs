// @type concolic
// @target es6+ Array.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([9,5])
  __IS_SAT__(symbolic.includes(5, -1), true);

}

__test_symbolic__(__symbolic__('s', [5,9]));
