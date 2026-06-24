// @type concolic
// @target es6+ Array.of
// @feature builtin of

function __test_symbolic__(symbolic) {
  if (symbolic[0] > 0) {
    var r = Array.of(symbolic[0]);
    // @witness __test_symbolic__([5])
    __IS_SAT__(r[0] === 5, true);
  }
}

__test_symbolic__(__symbolic__('s', [3]));
