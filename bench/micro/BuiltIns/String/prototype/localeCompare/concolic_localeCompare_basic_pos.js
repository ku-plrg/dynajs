// @type concolic
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// @done


function __test_symbolic__(symbolic) {

  // @witness a string compares equal (0) to itself
  __symbolic_assert__(symbolic.localeCompare(symbolic) === 0, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
