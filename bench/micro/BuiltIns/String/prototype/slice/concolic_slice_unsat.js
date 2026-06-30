// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  // @witness slice(1, 0) always returns empty string
  __IS_SAT__(symbolic.slice(1, 0) !== '', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
