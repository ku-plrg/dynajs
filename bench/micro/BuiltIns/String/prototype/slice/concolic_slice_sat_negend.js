// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic.slice(0, -1) === 'ab', true);

}

__test_symbolic__(__symbolic__('s', "abcd"));
