// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring
// @done


function __test_symbolic__(symbolic) {

  // @witness substring(1, 2) length is less than 1
  __IS_SAT__(symbolic.substring(1, 2).length > 1, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
