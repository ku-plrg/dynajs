// @type concolic
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.startsWith('a')) {

    // @witness __test_symbolic__("aaa")
    __IS_SAT__(!(symbolic.startsWith('ab')),true)

  }

}

__test_symbolic__(__symbolic__('s', "abc"));
