// @type concolic
// @target es6+ String.prototype.codePointAt
// @feature builtin codePointAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("zbc")
  __symbolic_assert__(symbolic.codePointAt(0) === 97, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
