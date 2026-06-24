// @type concolic
// @target es5 String.prototype.replace
// @feature builtin replace
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.replace('a', 'X') !== 'Xbc', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
