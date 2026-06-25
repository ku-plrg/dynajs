// @type concolic
// @target es6+ Map.prototype.has
// @feature builtin has

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(10, "a");
  // @witness __test_symbolic__(10)
  __IS_SAT__(m.has(symbolic), true);
}

__test_symbolic__(__symbolic__('s', 5));
