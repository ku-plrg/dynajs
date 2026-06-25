// @type concolic
// @target es6+ Object.assign
// @feature builtin assign

function __test_symbolic__(symbolic) {
  var r = Object.assign({ a: 1 }, { a: symbolic });
  if (symbolic === 7) {
    // @witness assign copies the source's a over the target, so r.a is exactly symbolic (7)
    __IS_SAT__(r.a !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
