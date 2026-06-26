// @type concolic
// @target es6+ Set.prototype.clear
// @feature builtin clear
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2, 3]);
  s.clear();
  s.add(symbolic);
  // @witness __test_symbolic__(9)
  __IS_SAT__(s.has(9), true);
}

__test_symbolic__(__symbolic__('s', 3));
