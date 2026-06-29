// @type concolic
// @target es6+ Object.assign
// @feature builtin assign

function __test_symbolic__(symbolic) {
  var r = Object.assign({}, { x: symbolic });
  // @witness __test_symbolic__(9)
  __IS_SAT__(r.x === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
