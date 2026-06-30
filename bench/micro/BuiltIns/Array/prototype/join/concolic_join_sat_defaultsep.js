// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([1,2,3])
  __IS_SAT__(symbolic.join() === "1,2,3", true);

}

__test_symbolic__(__symbolic__('s', [1,2]));
