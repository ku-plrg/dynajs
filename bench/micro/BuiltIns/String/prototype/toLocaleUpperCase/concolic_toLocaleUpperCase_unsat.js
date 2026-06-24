// @type concolic
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase
// @done


function __test_symbolic__(symbolic) {

  // @witness uppercase cannot contain lowercase letters
  __IS_SAT__(symbolic.toLocaleUpperCase().includes('a'), false);

}

__test_symbolic__(__symbolic__('s', "abc"));
