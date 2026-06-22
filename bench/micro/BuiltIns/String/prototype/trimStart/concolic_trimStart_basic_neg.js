// @type concolic
// @target es6+ String.prototype.trimStart
// @feature builtin trimStart
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.trimStart() === 'abc', false);

}

__test_symbolic__(__symbolic__('s', "  abc"));
