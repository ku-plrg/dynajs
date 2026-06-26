// @type concolic
// @target es6+ Set.prototype.values
// @feature builtin values
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  // @witness __test_symbolic__(9)
  __IS_SAT__(s.values().next().value === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
