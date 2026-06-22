// @type concolic
// @target es5 String.prototype.trim
// @feature builtin trim
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.trim().length === symbolic.length) {
  // @witness trim never lengthens the string
    __symbolic_assert__(symbolic[0] !== ' '&& symbolic[symbolic.length - 1] !== ' ' , true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "  abc  "));
