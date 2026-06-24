// @type concolic
// @target es6+ Array.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic[0] === 7) {
    // @witness __test_symbolic__([7, 8])
    __IS_SAT__(symbolic.keys().next().value === 0, true);
  }
}

__test_symbolic__(__symbolic__('s', [7, 0]));
