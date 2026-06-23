// @type concolic
// @target es5 String.prototype.localeCompare
// @feature builtin localeCompare
// @done


function __test_symbolic__(symbolic) {

  // @witness any string compares equal (0) to itself
  __IS_SAT__(symbolic.localeCompare(symbolic) !== 0, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
