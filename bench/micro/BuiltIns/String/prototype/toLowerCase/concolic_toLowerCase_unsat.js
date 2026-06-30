// @type concolic
// @target es5 String.prototype.toLowerCase
// @feature builtin toLowerCase
// @done

function __test_symbolic__(symbolic) {

  // @witness lowercase cannot contain uppercase letters
  __IS_SAT__(symbolic.toLowerCase().includes('A'), false);

}

__test_symbolic__(__symbolic__('s', "ABC"));
