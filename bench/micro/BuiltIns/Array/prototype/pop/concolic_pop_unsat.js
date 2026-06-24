// @type concolic
// @target es5 Array.prototype.pop
// @feature builtin pop

function __test_symbolic__(symbolic) {
  if (symbolic.length === 1) {
    symbolic.pop();
    // @witness pop on a length-1 array always leaves length exactly 0
    __IS_SAT__(symbolic.length !== 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [7]));
