// @type concolic
// @target es5 String.prototype.trimRight
// @feature builtin trimRight
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.trimRight().length === symbolic.length) {
  // @witness trimRight never lengthens the string
    __symbolic_assert__(symbolic[symbolic.length - 1] !== ' ' , true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc  "));
