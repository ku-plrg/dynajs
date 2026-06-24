// @type concolic
// @target es6+ Array.prototype.with
// @feature builtin with

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.with(0, 5);
    // @witness __test_symbolic__([1, 9])
    __IS_SAT__(r[1] === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
