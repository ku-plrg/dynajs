// @type concolic
// @target es6+ Map.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  // @witness __test_symbolic__(9)
  __IS_SAT__(m.keys().next().value === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
