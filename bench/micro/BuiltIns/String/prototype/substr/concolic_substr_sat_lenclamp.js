// @type concolic
// @target es5 String.prototype.substr
// @feature builtin substr
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abcd")
  __IS_SAT__(symbolic.substr(2, 10) === 'cd', true);

}

__test_symbolic__(__symbolic__('s', "abcde"));
