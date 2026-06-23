// @type concolic
// @target es5 Array.prototype.indexOf
// @feature builtin indexof

function __test_symbolic__(symbolic) {

  if (symbolic.indexOf(5) !== -1) {
    // @witness indexOf returns a found index >= 0, so a result < 0 is impossible
    __IS_SAT__(symbolic.indexOf(5) < 0, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', [5]));
