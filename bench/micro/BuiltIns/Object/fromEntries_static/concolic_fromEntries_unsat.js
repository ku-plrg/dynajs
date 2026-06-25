// @type concolic
// @target es6+ Object.fromEntries
// @feature builtin fromentries

function __test_symbolic__(symbolic) {
  if (Object.fromEntries([["k", symbolic]]).k === 7) {
    // @witness fromEntries stores symbolic under "k", so result.k === 7 forces symbolic to 7
    __IS_SAT__(symbolic !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
