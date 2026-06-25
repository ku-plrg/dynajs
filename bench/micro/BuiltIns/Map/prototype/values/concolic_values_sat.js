// @type concolic
// @target es6+ Map.prototype.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("k", symbolic);
  // @witness __test_symbolic__(9)
  __IS_SAT__(m.values().next().value === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
