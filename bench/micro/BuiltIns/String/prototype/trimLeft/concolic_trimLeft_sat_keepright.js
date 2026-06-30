// @type concolic
// @target es5 String.prototype.trimLeft
// @feature builtin trimLeft
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__(" a ")
  __IS_SAT__(symbolic.trimLeft() === 'a ', true);

}

__test_symbolic__(__symbolic__('s', "a"));
