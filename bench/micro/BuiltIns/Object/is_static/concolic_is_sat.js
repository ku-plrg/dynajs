// @type concolic
// @target es6+ Object.is
// @feature builtin is

function __test_symbolic__(symbolic) {
  // @witness __test_symbolic__(5)
  __IS_SAT__(Object.is(symbolic, 5), true);
}

__test_symbolic__(__symbolic__('s', 3));
