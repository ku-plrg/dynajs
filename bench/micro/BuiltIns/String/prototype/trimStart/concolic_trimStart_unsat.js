// @type concolic
// @target es6+ String.prototype.trimStart
// @feature builtin trimStart
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.trimStart().length === symbolic.length) {
  // @witness trimStart not shortening means no leading space at index 0
    __IS_SAT__(symbolic[0] === ' ' , false);
  } else {
    __IS_SAT__(true, false);
  }


}

__test_symbolic__(__symbolic__('s', "  abc"));
