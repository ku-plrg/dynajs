// @type concolic
// @target es6+ String.prototype.repeat
// @feature builtin repeat
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("ab")
  __IS_SAT__(symbolic.repeat(2).length === 4, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
