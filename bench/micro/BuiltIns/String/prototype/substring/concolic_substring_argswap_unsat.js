// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring
// @done


function __test_symbolic__(symbolic) {

  // @witness substring swaps args when a>b, so (2,0) equals (0,2)
  __IS_SAT__(symbolic.substring(2, 0) !== symbolic.substring(0, 2), false);

}

__test_symbolic__(__symbolic__('s', "abc"));
