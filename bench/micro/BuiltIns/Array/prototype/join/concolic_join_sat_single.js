// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([5])
  __IS_SAT__(symbolic.join("-") === "5", true);

}

__test_symbolic__(__symbolic__('s', [5,6]));
