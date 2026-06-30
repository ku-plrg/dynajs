// @type concolic
// @target es5 String.prototype.trim
// @feature builtin trim
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("  a b  ")
  __IS_SAT__(symbolic.trim() === 'a b', true);

}

__test_symbolic__(__symbolic__('s', " ab "));
