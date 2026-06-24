// @type concolic
// @target es5 String.prototype.trimRight
// @feature builtin trimRight
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.trimRight().length === symbolic.length) {
  // @witness no-shorten guard means no trailing space, so last char isn't ' '
    __IS_SAT__(symbolic[symbolic.length - 1] === ' ' , false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc  "));
