// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.indexOf('a') !== -1) {
    // @witness the indexOf('a')!==-1 guard means 'a' is present somewhere
    __IS_SAT__(!symbolic.includes('a'), false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
