// @type concolic
// @target es6+ Map.prototype.set
// @feature builtin set

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("x", symbolic);
  // @witness __test_symbolic__(9)
  __IS_SAT__(m.get("x") === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
