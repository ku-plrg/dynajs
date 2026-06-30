// @type concolic
// @target es5 String.prototype.substring
// @feature builtin substring
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic.substring(2, 0) === 'ab', true);

}

__test_symbolic__(__symbolic__('s', "xyz"));
