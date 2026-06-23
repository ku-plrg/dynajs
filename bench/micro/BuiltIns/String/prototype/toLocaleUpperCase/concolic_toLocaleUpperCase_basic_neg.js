// @type concolic
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.toLocaleUpperCase() !== 'ABC', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
