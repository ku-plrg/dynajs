// @type concolic
// @target es6+ Set.prototype.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.has(symbolic)) {
    // @witness values() yields the stored elements, so the first equals symbolic
    __IS_SAT__(s.values().next().value !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
