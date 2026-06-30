// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abz")
  __IS_SAT__(symbolic.charAt(2) === 'z', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
