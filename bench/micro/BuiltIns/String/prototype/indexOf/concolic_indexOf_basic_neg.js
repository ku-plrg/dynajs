// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done

function __test_symbolic__(symbolic) {

  // @winess __test_symbolic__('aabb')
  __symbolic_assert__(symbolic.indexOf('b') === 1, false);


}

__test_symbolic__(__symbolic__('s', "abc"));
