// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__([null,null])
  __IS_SAT__(symbolic.join("-") === "-", true);

}

__test_symbolic__(__symbolic__('s', [1,2]));
