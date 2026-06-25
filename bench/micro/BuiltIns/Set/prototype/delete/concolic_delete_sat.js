// @type concolic
// @target es6+ Set.prototype.delete
// @feature builtin delete

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  // @witness __test_symbolic__(5)
  __IS_SAT__(s.delete(5), true);
}

__test_symbolic__(__symbolic__('s', 3));
