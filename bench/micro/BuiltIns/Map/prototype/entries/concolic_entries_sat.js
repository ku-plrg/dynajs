// @type concolic
// @target es6+ Map.prototype.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  var first = m.entries().next().value;
  // @witness __test_symbolic__(9)
  __IS_SAT__(first[0] === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
