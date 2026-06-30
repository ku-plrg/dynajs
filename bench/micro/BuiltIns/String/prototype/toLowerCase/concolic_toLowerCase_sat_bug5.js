// @type concolic
// @target es5 String.prototype.toLowerCase
// @feature builtin toLowerCase
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("Abc")
  __IS_SAT__(symbolic.toLowerCase() === 'abc' && symbolic.charAt(0) === 'A', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
