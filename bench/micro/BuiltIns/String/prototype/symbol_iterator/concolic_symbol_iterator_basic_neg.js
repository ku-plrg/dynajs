// @type concolic
// @target es6+ String.prototype.symbol_iterator
// @feature builtin symbol_iterator


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("ab")
  __IS_SAT__([...symbolic].length !== 3, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
