// @type concolic
// @target es6+ Set.prototype.clear
// @feature builtin clear
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  if (s.has(symbolic)) {
    s.clear();
    // @witness clear() empties the set, so has(symbolic) cannot hold afterward
    __IS_SAT__(s.has(symbolic), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
