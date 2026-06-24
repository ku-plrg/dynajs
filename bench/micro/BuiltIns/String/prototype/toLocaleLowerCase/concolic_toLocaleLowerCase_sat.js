// @type concolic
// @target es5 String.prototype.toLocaleLowerCase
// @feature builtin toLocaleLowerCase
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.toLocaleLowerCase() !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
