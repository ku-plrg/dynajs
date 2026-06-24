// @type concolic
// @target es5 Array.prototype.splice
// @feature builtin splice

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    symbolic.splice(1, 1);
    // @witness __test_symbolic__([1, 2, 9])
    __IS_SAT__(symbolic[1] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
