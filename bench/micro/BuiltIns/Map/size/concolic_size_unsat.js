// @type concolic
// @target es6+ Map.size
// @feature builtin size

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  m.set(symbolic, 2);
  if (m.has(symbolic)) {
    // @witness setting the same key twice overwrites in place, so size stays 1, never 2
    __IS_SAT__(m.size === 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
