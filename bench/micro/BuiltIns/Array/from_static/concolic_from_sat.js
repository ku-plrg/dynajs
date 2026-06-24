// @type concolic
// @target es6+ Array.from
// @feature builtin from

function __test_symbolic__(symbolic) {
  if (symbolic.length === 1) {
    var r = Array.from(symbolic);
    // @witness __test_symbolic__([8])
    __IS_SAT__(r[0] === 8, true);
  }
}

__test_symbolic__(__symbolic__('s', [3]));
