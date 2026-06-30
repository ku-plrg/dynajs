// @type concolic
// @target es5 Array.prototype.push
// @feature builtin push
// @done


function __test_symbolic__(symbolic) {

  symbolic.push(5);
  // @witness __test_symbolic__([])
  __IS_SAT__(symbolic[0] === 5, true);

}

__test_symbolic__(__symbolic__('s', [7]));
