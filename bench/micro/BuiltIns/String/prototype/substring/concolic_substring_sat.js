// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.substring(0, 2) === 'ab') {
    // @witness __test_symbolic__("abz")
    __IS_SAT__(symbolic[2] !== 'c', true);
  } else {
    __IS_SAT__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
