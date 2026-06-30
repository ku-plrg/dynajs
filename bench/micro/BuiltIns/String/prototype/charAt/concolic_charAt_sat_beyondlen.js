// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abcd")
  __IS_SAT__(symbolic.charAt(3) === 'd', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
