// @type concolic
// @target es6+ Map.prototype[Symbol.iterator]
// @feature builtin symbol_iterator

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  var first = m[Symbol.iterator]().next().value;
  // @witness __test_symbolic__(9)
  __IS_SAT__(first[0] === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
