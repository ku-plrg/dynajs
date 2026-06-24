// @type concolic
// @target es6+ Array.prototype.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  if (symbolic.length >= 1) {
    var first = symbolic.values().next().value;
    // @witness __test_symbolic__([9])
    __IS_SAT__(first === 9, true);
  }
}

__test_symbolic__(__symbolic__('s', [3]));
