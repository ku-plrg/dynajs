// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xxab")
  __IS_SAT__(symbolic.lastIndexOf('ab') === 2, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
