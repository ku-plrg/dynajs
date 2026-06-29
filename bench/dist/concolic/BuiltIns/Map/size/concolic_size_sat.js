// @type concolic
// @target es6+ Map.size
// @feature builtin size

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("a", 1);
  m.set(symbolic, 2);
  // @witness __test_symbolic__("b")
  __IS_SAT__(m.size === 2, true);
}

__test_symbolic__(__symbolic__('s', "a"));
