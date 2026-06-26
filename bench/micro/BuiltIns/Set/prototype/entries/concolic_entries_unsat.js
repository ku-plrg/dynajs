// @type concolic
// @target es6+ Set.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.entries().next().value[0] === symbolic) {
    // @witness Set entries pair each value with itself, so the second component equals the first (symbolic)
    __IS_SAT__(s.entries().next().value[1] !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
