// @type concolic
// @target es6+ String.prototype.endsWith
// @feature builtin endsWith
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.endsWith('c')) {

    // @witness __test_symbolic__("ac")
    __IS_SAT__(!(symbolic.endsWith('bc')),true)
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
