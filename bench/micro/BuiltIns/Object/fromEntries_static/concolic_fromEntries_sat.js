// @type concolic
// @target es6+ Object.fromEntries
// @feature builtin fromentries

function __test_symbolic__(symbolic) {
  var o = Object.fromEntries([["x", symbolic]]);
  // @witness __test_symbolic__(9)
  __IS_SAT__(o.x === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
