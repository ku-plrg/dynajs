// @type concolic
// @target es5 String.prototype.toUpperCase
// @feature builtin toUpperCase
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.toUpperCase() !== 'ABC', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
