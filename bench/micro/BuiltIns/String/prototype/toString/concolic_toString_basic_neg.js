// @type concolic
// @target es5 String.prototype.toString
// @feature builtin toString
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.toString() !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
