// @type concolic
// @target es6+ Map.size
// @feature builtin size

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  if (m.size >= 1) {
    // @witness after set the map holds at least one entry, so size < 1 is impossible
    __IS_SAT__(m.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
