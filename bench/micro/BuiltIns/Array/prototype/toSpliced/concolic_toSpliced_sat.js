// @type concolic
// @target es6+ Array.prototype.toSpliced
// @feature builtin toSpliced

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    var r = symbolic.toSpliced(1, 1);
    // @witness __test_symbolic__([1, 2, 9])
    __IS_SAT__(r[1] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
