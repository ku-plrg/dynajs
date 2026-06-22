// @type concolic
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abcde")
  __symbolic_assert__(symbolic.padStart(5, '.')[0] === '.', false)

}

__test_symbolic__(__symbolic__('s', "abcd"));
