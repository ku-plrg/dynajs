// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("ab")
  __IS_SAT__(symbolic.lastIndexOf('b', 0) === -1, true);

}

__test_symbolic__(__symbolic__('s', "ba"));
