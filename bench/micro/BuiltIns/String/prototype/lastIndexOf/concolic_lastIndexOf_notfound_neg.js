// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.lastIndexOf('z') === -1) {
    // @witness __test_symbolic__("abc")
    __IS_SAT__(symbolic.lastIndexOf(0) !== 'a', true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
