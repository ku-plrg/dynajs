// @type concolic
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done


function __test_symbolic__(symbolic) {

  // @witness normalize() always returns a string
  __IS_SAT__(typeof symbolic.normalize() !== 'string', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
