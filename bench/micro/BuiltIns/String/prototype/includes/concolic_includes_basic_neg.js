// @type concolic
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.includes('b')) {
    // @witness __test_symbolic__("bbb")
    __IS_SAT__(!(symbolic.includes('ab')), true)
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
