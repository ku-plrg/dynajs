// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("aab")
  __IS_SAT__(symbolic.charAt(0) === symbolic.charAt(1), true);

}

__test_symbolic__(__symbolic__('s', "abc"));
