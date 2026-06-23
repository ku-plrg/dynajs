// @type concolic
// @target es6+ String.prototype.isWellFormed
// @feature builtin isWellFormed
// @done


function __test_symbolic__(symbolic) {

  // @witness isWellFormed() always returns a boolean
  __IS_SAT__(typeof symbolic.isWellFormed() !== 'boolean', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
