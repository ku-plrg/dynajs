// @type concolic
// @target es5 String.prototype.trimRight
// @feature builtin trimRight
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.trimRight() === '   abc') {
    // @witness symbolic must be longer than 3 characters to trim to "abc"
    __IS_SAT__(symbolic.length < 3, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "   abc  "));
