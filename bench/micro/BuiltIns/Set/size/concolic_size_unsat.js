// @type concolic
// @target es6+ Set.size
// @feature builtin size

function __test_symbolic__(symbolic) {
  var s = new Set();
  s.add(symbolic);
  s.add(symbolic);
  if (s.has(symbolic)) {
    // @witness adding the same value twice is idempotent (SameValueZero), so size stays 1, never 2
    __IS_SAT__(s.size === 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
