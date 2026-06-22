// @type concolic
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done


function __test_symbolic__(symbolic) {

  // @witness normalize returns a string
  __symbolic_assert__(typeof symbolic.normalize() === 'string', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
