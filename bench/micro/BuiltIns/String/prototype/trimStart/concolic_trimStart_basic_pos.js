// @type concolic
// @target es6+ String.prototype.trimStart
// @feature builtin trimStart
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.trimStart().length === symbolic.length) {
  // @witness trimStart never lengthens the string
    __symbolic_assert__(symbolic[0] !== ' ' , true);
  } else {
    __symbolic_assert__(false, true);
  }


}

__test_symbolic__(__symbolic__('s', "  abc"));
