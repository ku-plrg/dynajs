// @type concolic
// @target es5 Array.prototype.pop
// @feature builtin pop
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.pop();
  // @witness __test_symbolic__([1,5])
  __IS_SAT__(r === 5, true);

}

__test_symbolic__(__symbolic__('s', [7,8]));
