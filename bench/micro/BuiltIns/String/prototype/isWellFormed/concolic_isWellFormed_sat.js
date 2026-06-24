// @type concolic
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("\ud800")
  __IS_SAT__(symbolic.isWellFormed() !== true, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
