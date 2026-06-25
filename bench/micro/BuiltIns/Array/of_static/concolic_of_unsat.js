// @type concolic
// @target es6+ Array.of
// @feature builtin of

function __test_symbolic__(symbolic) {
  if (Array.of(symbolic[0], 9)[0] === 7) {
    // @witness Array.of puts its first argument at index 0, so result[0] === 7 pins symbolic[0] to 7
    __IS_SAT__(symbolic[0] !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [7]));
