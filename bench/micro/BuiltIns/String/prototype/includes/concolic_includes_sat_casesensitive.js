// @type concolic
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xABy")
  __IS_SAT__(symbolic.includes('AB'), true);

}

__test_symbolic__(__symbolic__('s', "abc"));
