// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("zabc")
  __IS_SAT__(symbolic.slice(-3, -1) === 'ab', true);

}

__test_symbolic__(__symbolic__('s', "wxyz"));
