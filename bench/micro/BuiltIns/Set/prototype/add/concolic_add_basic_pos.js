// @type concolic
// @target es6+ Set.prototype.add
// @feature builtin add
// @done



function __test_symbolic__(symbolic) {

  var s = new Set(symbolic);
  // @witness size of Set is at least 1 when symbolic is added
  __IS_SAT__(s.size < 1, false);
}

__test_symbolic__(__symbolic__('s', 'x'));