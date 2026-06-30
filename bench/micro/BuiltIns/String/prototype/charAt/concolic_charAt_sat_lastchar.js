// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.charAt(symbolic.length - 1) === 'z', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
