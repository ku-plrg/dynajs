// @type concolic
// @target es6+ Set.size
// @feature builtin size

function __test_symbolic__(symbolic) {
  var s = new Set();
  s.add(symbolic);
  if (s.size >= 1) {
    // @witness after adding an element the size is at least 1, so size < 1 is impossible
    __IS_SAT__(s.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
