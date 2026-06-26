// @type concolic
// @target es6+ Map.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  // @witness __test_symbolic__(9)
  __IS_SAT__(m.entries().next().value[0] === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
