// @type concolic
// @target es5 Array.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([3,3])
  __IS_SAT__(symbolic.indexOf(3) === 0, true);

}

__test_symbolic__(__symbolic__('s', [9,3]));
