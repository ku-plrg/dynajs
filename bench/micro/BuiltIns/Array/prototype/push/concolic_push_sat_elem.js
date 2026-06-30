// @type concolic
// @target es5 Array.prototype.push
// @feature builtin push
// @done


function __test_symbolic__(symbolic) {

  symbolic.push(42);
  // @witness __test_symbolic__([7,8])
  __IS_SAT__(symbolic[2] === 42, true);

}

__test_symbolic__(__symbolic__('s', [7]));
