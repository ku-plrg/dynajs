// @type concolic
// @target es5 String.prototype.trimLeft
// @feature builtin trimLeft
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("   abc")
  __IS_SAT__(symbolic.trimLeft() === 'abc', true);

}

__test_symbolic__(__symbolic__('s', " x"));
