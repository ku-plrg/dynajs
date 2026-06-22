// @type concolic
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @done


function __test_symbolic__(symbolic) {

  // @witness isWellFormed returns a boolean
  __symbolic_assert__(typeof symbolic.isWellFormed() === 'boolean', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
