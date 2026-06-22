// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.indexOf('z') === -1) {
    // @witness __test_symbolic__("xbc")
    __symbolic_assert__(symbolic.indexOf(0) === 'a', false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
