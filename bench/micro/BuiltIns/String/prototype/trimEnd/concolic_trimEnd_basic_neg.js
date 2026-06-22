// @type concolic
// @target es6+ String.prototype.trimEnd
// @feature builtin trimEnd
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.trimEnd() === 'abc', false);

}

__test_symbolic__(__symbolic__('s', "abc  "));
