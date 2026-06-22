// @type concolic
// @target es6+ String.prototype.trimEnd
// @feature builtin trimEnd
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.trimEnd().length === symbolic.length) {
  // @witness trimEnd never lengthens the string
    __symbolic_assert__(symbolic[symbolic.length - 1] !== ' ' , true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc  "));
