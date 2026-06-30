// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic.indexOf('bc') === 1, true);

}

__test_symbolic__(__symbolic__('s', "axc"));
