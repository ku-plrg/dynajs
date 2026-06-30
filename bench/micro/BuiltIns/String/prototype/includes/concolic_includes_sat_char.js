// @type concolic
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("zoo")
  __IS_SAT__(symbolic.includes('z'), true);

}

__test_symbolic__(__symbolic__('s', "abc"));
