// @type concolic
// @target es6+ Set.prototype.has
// @feature builtin has

function __test_symbolic__(symbolic) {

  var s = new Set(symbolic);
  if (s.has(7)) {
    // @witness __test_symbolic__([7])
    __IS_SAT__(!(s.has(99)), true);
  }

}

__test_symbolic__(__symbolic__('s', [7]));
