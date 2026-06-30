// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic.lastIndexOf('z') === -1, true);

}

__test_symbolic__(__symbolic__('s', "zoo"));
