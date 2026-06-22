// @type concolic
// @target es5 String.prototype.split
// @feature builtin split
// @done


function __test_symbolic__(symbolic) {

  var p = symbolic.split('-');
    // @witness __test_symbolic__("ab-x")
  __symbolic_assert__(symbolic.split('-')[1] === 'c', false);


}

__test_symbolic__(__symbolic__('s', "ab-c"));
