// @type concolic
// @target es5 Array.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([1,2])
  __IS_SAT__(symbolic.indexOf(9) === -1, true);

}

__test_symbolic__(__symbolic__('s', [9]));
