// @type concolic
// @target es6+ Object.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  var o = { x: symbolic };
  // @witness __test_symbolic__(9)
  __IS_SAT__(Object.values(o)[0] === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
