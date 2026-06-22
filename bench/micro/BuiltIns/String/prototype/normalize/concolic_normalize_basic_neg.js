// @type concolic
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done

function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.normalize() === 'abc', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
