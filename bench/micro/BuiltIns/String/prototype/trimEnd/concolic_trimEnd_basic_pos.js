// @type concolic
// @target es6+ String.prototype.trimEnd
// @feature builtin trimEnd
// @done


function __test_symbolic__(symbolic) {


  if (symbolic.trimEnd().length === symbolic.length) {
  // @witness trimEnd not shortening means no trailing space
    __IS_SAT__(symbolic[symbolic.length - 1] === ' ' , false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc  "));
