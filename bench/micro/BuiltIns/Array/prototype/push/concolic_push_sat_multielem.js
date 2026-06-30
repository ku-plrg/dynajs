// @type concolic
// @target es5 Array.prototype.push
// @feature builtin push
// @done


function __test_symbolic__(symbolic) {

  symbolic.push(8, 9);
  // @witness __test_symbolic__([1,2])
  __IS_SAT__(symbolic[3] === 9, true);

}

__test_symbolic__(__symbolic__('s', [1]));
