// @type concolic
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase


function __test_symbolic__(symbolic) {

  // @witness toLocaleUpperCase never shortens, so result length stays >= original
  __IS_SAT__(symbolic.toLocaleUpperCase().length < symbolic.length, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
