// @type concolic
// @target es5 Array.prototype.pop
// @feature builtin pop
// @done


function __test_symbolic__(symbolic) {

  symbolic.pop();
  // @witness __test_symbolic__([7,8,9])
  __IS_SAT__(symbolic.length === 2, true);

}

__test_symbolic__(__symbolic__('s', [7,8]));
