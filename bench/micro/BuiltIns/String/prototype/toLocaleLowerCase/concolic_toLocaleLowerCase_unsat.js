// @type concolic
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase
// @done


function __test_symbolic__(symbolic) {

  // @witness lowercase cannot contain uppercase letters
  __IS_SAT__(symbolic.toLocaleLowerCase().includes('A'), false);

}

__test_symbolic__(__symbolic__('s', "abc"));
