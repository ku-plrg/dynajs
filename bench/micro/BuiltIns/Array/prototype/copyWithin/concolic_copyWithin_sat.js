// @type concolic
// @target es6+ Array.prototype.copyWithin
// @feature builtin copyWithin

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    symbolic.copyWithin(0, 2);
    // @witness __test_symbolic__([1, 2, 9])
    __IS_SAT__(symbolic[0] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
