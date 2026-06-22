// @type concolic
// @target es5 String.prototype.replace
// @feature builtin replace
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.replace('a', 'X');
  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(r === 'Xbc', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
