// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("bbb")
  __symbolic_assert__(symbolic.charAt(0) === 'a', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
