// @type concolic
// @target es6+ Set.prototype.has
// @feature builtin has

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  // @witness __test_symbolic__(9)
  __IS_SAT__(s.has(9), true);
}

__test_symbolic__(__symbolic__('s', 3));
