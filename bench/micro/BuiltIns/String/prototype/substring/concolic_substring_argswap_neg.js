// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring


function __test_symbolic__(symbolic) {

  if (symbolic.substring(2, 0) === 'ab') {
    // @witness __test_symbolic__("abx")
    __IS_SAT__(symbolic.charAt(2) !== 'c', true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
