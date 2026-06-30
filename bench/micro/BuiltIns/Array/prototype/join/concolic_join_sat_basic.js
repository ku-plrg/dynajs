// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([9,0])
  __IS_SAT__(symbolic.join("-") === "9-0", true);

}

__test_symbolic__(__symbolic__('s', [1,2]));
