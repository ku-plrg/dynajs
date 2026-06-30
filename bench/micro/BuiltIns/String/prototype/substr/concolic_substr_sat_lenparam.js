// @type concolic
// @target es5 String.prototype.substr
// @feature builtin substr
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic.substr(0, 2) === 'ab', true);

}

__test_symbolic__(__symbolic__('s', "xyz"));
