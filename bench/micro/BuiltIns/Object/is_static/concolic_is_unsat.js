// @type concolic
// @target es6+ Object.is
// @feature builtin is

function __test_symbolic__(symbolic) {
  if (Object.is(symbolic, 7)) {
    // @witness Object.is(symbolic, 7) holds only when symbolic is 7
    __IS_SAT__(symbolic !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
