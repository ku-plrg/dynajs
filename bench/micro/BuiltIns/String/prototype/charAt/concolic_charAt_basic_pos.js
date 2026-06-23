// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.charAt(0) === 'a' && symbolic.charAt(1) === 'b') {
    //@witness the charAt(0)/charAt(1) guards pin indices 0 and 1, forcing length>=2
    __IS_SAT__(symbolic.length < 2, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
