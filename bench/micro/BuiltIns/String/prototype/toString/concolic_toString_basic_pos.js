// @type concolic
// @target es5 String.prototype.toString
// @feature builtin toString
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.toString() === 'ab') {
    // @witness the toString()==='ab' guard pins symbolic to 'ab'
    __IS_SAT__(symbolic !== 'ab', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "ab"));
