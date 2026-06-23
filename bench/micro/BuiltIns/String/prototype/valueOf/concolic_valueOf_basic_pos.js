// @type concolic
// @target es5 String.prototype.valueOf
// @feature builtin valueOf
// @done

function __test_symbolic__(symbolic) {

  if (symbolic.valueOf() === 'ab') {
    // @witness valueOf()==='ab' guard pins symbolic to 'ab'
    __IS_SAT__(symbolic !== 'ab', false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "ab"));
