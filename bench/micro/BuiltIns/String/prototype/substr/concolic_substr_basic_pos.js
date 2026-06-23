// @type concolic
// @target es5 String.prototype.substr
// @feature builtin substr


function __test_symbolic__(symbolic) {

  // @witness at start 0, substr and substring take the same first 2 chars
  __IS_SAT__(symbolic.substr(0, 2) !== symbolic.substring(0, 2), false);

}

__test_symbolic__(__symbolic__('s', "abcde"));
