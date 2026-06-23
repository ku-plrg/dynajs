// @type concolic
// @target es5 Array.prototype.indexOf
// @feature builtin indexof

function __test_symbolic__(symbolic) {

  if (symbolic.indexOf(7) !== -1) {
    // @witness __test_symbolic__([1, 7])
    __IS_SAT__(symbolic.indexOf(7) > 0, true);
  }

}

__test_symbolic__(__symbolic__('s', [7]));
