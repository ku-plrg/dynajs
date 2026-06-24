// @type concolic
// @target es5 String.prototype.charCodeAt
// @feature builtin charCodeAt
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("zbc")
  __IS_SAT__(symbolic.charCodeAt(0) !== 97, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
