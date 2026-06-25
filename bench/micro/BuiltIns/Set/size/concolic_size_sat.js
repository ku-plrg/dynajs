// @type concolic
// @target es6+ Set.size
// @feature builtin size

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  // @witness __test_symbolic__(9)
  __IS_SAT__(s.size === 3, true);
}

__test_symbolic__(__symbolic__('s', 1));
