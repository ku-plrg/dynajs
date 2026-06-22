// @type concolic
// @target es5 String.prototype.trimLeft
// @feature builtin trimLeft
// @done


function __test_symbolic__(symbolic) {

  // @witness trimLeft never lengthens the string
    if (symbolic.trimLeft().length === symbolic.length) {
  // @witness trimLeft never lengthens the string
    __symbolic_assert__(symbolic[0] !== ' ' , true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "  abc"));
