// @type concolic
// @target es5 String.prototype.substr
// @feature builtin substr
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abcde")
  __IS_SAT__(symbolic.substr(1).length === 4, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
