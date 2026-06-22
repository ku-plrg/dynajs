// @type concolic
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.localeCompare('abc') === 0, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
