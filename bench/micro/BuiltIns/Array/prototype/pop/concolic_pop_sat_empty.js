// @type concolic
// @target es5 Array.prototype.pop
// @feature builtin pop
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.pop();
  // @witness __test_symbolic__([])
  __IS_SAT__(r === undefined, true);

}

__test_symbolic__(__symbolic__('s', [7]));
