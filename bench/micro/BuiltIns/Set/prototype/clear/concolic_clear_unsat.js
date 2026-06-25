// @type concolic
// @target es6+ Set.prototype.clear
// @feature builtin clear

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  if (s.size >= 1) {
    s.clear();
    // @witness clear() removes every element, so size > 0 is impossible afterward
    __IS_SAT__(s.size > 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
