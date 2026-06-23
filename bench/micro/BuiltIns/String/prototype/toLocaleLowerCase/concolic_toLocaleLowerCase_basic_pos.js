// @type concolic
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase


function __test_symbolic__(symbolic) {

  // @witness toLocaleLowerCase is modeled to always return a string
  __IS_SAT__(typeof symbolic.toLocaleLowerCase() !== 'string', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
