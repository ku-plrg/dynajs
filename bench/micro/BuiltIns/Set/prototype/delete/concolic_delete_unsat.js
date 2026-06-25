// @type concolic
// @target es6+ Set.prototype.delete
// @feature builtin delete

function __test_symbolic__(symbolic) {
  var s = new Set([1, 2]);
  s.add(symbolic);
  if (s.has(symbolic)) {
    s.delete(symbolic);
    // @witness delete(symbolic) removes the element, so has(symbolic) cannot hold afterward
    __IS_SAT__(s.has(symbolic), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
