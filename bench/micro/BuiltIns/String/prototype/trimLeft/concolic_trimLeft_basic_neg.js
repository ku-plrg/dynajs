// @type concolic
// @target es5 String.prototype.trimLeft
// @feature builtin trimLeft
// @done

function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.trimLeft() === 'abc', false);

}

__test_symbolic__(__symbolic__('s', "  abc"));
