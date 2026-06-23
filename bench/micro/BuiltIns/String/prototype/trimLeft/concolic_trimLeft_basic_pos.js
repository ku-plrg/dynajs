// @type concolic
// @target es5 String.prototype.trimLeft
// @feature builtin trimLeft
// @done


function __test_symbolic__(symbolic) {

  // @witness trimLeft never lengthens the string
    if (symbolic.trimLeft().length === symbolic.length) {
  // @witness preserved-length guard means no leading space was trimmed
    __IS_SAT__(symbolic[0] === ' ' , false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "  abc"));
