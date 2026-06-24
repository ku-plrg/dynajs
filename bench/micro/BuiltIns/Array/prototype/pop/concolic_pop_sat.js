// @type concolic
// @target es5 Array.prototype.pop
// @feature builtin pop

function __test_symbolic__(symbolic) {
  if (symbolic.length >= 1) {
    symbolic.pop();
    // @witness __test_symbolic__([7])
    __IS_SAT__(symbolic.length === 0, true);
  }
}

__test_symbolic__(__symbolic__('s', [7]));
