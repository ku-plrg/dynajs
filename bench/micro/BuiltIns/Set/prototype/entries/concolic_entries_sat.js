// @type concolic
// @target es6+ Set.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  var first = s.entries().next().value;
  // @witness __test_symbolic__(9)
  __IS_SAT__(first[0] === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
