// @type concolic
// @target es6+ Set.prototype.values
// @feature builtin values
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.values().next().value === symbolic) {
    // @witness values() yields the stored element, so a first value means the set is non-empty
    __IS_SAT__(s.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
