// @type concolic
// @target es6+ Object.fromEntries
// @feature builtin fromentries

function __test_symbolic__(symbolic) {
  var o = Object.fromEntries([["k", symbolic]]);
  if (symbolic === 7) {
    // @witness fromEntries stores symbolic under "k", so o.k is exactly 7 on this path
    __IS_SAT__(o.k !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
