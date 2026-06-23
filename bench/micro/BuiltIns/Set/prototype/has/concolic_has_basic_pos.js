// @type concolic
// @target es6+ Set.prototype.has
// @feature builtin has

function __test_symbolic__(symbolic) {

  var s = new Set(symbolic);
  if (s.has(3)) {
    s.add(5);
    // @witness add(5) inserts 5, so has(5) is forced true on this path
    __IS_SAT__(!(s.has(5)), false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', [3]));
