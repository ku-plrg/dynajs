// @type concolic
// @target es5 String.prototype.split
// @feature builtin split
// @done


function __test_symbolic__(symbolic) {

  var p = symbolic.split('-');
    // @witness __test_symbolic__("ab-x")
  __IS_SAT__(symbolic.split('-')[1] !== 'c', true);


}

__test_symbolic__(__symbolic__('s', "ab-c"));
