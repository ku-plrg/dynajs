// @type concolic
// @target es5 String.prototype.toUpperCase
// @feature builtin toUpperCase


function __test_symbolic__(symbolic) {

  // @witness uppercasing never shortens a string, so length cannot decrease
  __IS_SAT__(symbolic.toUpperCase().length < symbolic.length, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
