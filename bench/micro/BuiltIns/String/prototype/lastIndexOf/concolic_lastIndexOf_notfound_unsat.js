// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.lastIndexOf('a') !== -1) {
    // @witness the lastIndexOf('a')!==-1 guard means 'a' is present somewhere
    __IS_SAT__(!symbolic.includes('a'), false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
