// @type concolic
// @target es5 String.prototype.trimRight
// @feature builtin trimRight
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("a ")
  __IS_SAT__(symbolic.length === 2 && symbolic.trimRight() === 'a', true);

}

__test_symbolic__(__symbolic__('s', "ab"));
