// @type concolic
// @target es6+ Array.prototype.toSorted
// @feature builtin toSorted

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.toSorted(function (a, b) { return a - b; });
    // @witness __test_symbolic__([5, 5])
    __IS_SAT__(r[0] === r[1], true);
  }
}

__test_symbolic__(__symbolic__('s', [2, 1]));
