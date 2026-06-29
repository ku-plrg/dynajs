// @type concolic
// @target es6+ Object.entries
// @feature builtin entries

function __test_symbolic__(symbolic) {
  var o = { x: symbolic };
  // @witness __test_symbolic__(9)
  __IS_SAT__(Object.entries(o)[0][1] === 9, true);
}

__test_symbolic__(__symbolic__('s', 3));
