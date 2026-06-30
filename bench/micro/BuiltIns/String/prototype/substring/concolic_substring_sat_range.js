// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abcd")
  __IS_SAT__(symbolic.substring(1, 3) === 'bc', true);

}

__test_symbolic__(__symbolic__('s', "axyz"));
