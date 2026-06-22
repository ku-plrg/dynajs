// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.slice(0, 2) === 'ab') {
    // @witness __test_symbolic__("abz")
    __symbolic_assert__(symbolic.slice(0, 3) === 'abc', false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));