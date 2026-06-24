// @type concolic
// @target es2023 Array.prototype.toReversed
// @feature builtin toReversed

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.toReversed();
    // @witness __test_symbolic__([1, 9])
    __IS_SAT__(r[0] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
