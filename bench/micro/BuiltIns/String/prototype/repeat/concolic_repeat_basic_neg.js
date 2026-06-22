// @type concolic
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.repeat(2) === 'abcabc', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
