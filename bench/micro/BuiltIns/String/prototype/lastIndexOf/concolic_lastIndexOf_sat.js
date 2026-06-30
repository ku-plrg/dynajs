// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.lastIndexOf('b') === 2) {
    // @witness __test_symbolic__("bbb")
    __IS_SAT__(symbolic.indexOf('b') === 0, true);
  } else {
    __IS_SAT__(false, true);
  }


}

__test_symbolic__(__symbolic__('s', "aab"));
