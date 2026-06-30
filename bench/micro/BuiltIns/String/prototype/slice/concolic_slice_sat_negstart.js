// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.slice(-2) === 'yz', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
