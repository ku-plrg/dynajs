// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("abc")
  __IS_SAT__(symbolic.slice(1, 0) === '' && symbolic.length === 3, true);

}

__test_symbolic__(__symbolic__('s', "ab"));
