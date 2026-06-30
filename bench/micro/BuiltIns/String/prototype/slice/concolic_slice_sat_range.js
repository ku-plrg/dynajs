// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abz")
  __IS_SAT__(symbolic.slice(0, 3) !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
