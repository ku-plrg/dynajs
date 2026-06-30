// @type concolic
// @target es6+ Array.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([1,2,3])
  __IS_SAT__(symbolic.includes(3) && symbolic.length === 3, true);

}

__test_symbolic__(__symbolic__('s', [3]));
