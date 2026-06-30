// @type concolic
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("bab")
  __IS_SAT__(symbolic.includes('a', 1), true);

}

__test_symbolic__(__symbolic__('s', "abc"));
