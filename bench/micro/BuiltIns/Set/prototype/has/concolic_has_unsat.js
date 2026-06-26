// @type concolic
// @target es6+ Set.prototype.has
// @feature builtin has
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  if (s.has(symbolic)) {
    // @witness has(symbolic) holds only when the set is non-empty, so size < 1 is impossible
    __IS_SAT__(s.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
