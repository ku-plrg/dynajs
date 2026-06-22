// @type concolic
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.endsWith('c')) {

    // @witness __test_symbolic__('ccc')
    __symbolic_assert__(symbolic.endsWith('bc'),false)
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
