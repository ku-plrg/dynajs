// @type concolic
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("\ud800")
  __symbolic_assert__(symbolic.isWellFormed() === true, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
