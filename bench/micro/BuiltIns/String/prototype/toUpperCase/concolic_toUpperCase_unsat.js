// @type concolic
// @target es5 String.prototype.toUpperCase
// @feature builtin toUpperCase
// @done

function __test_symbolic__(symbolic) {

  // @witness uppercase cannot contain lowercase letters
  __IS_SAT__(symbolic.toUpperCase().includes('a'), false);

}

__test_symbolic__(__symbolic__('s', "abc"));
