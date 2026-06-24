// @type concolic
// @target es6+ Set.prototype.add
// @feature builtin add
// @done


function __test_symbolic__(symbolic) {

  var s = new Set(symbolic);
  // @witness __test_symbolic__('a')
  __IS_SAT__(s.has('a'), true);
}

__test_symbolic__(__symbolic__('s', 'x'));
