// @type concolic
// @target es6+ Set.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.has(symbolic)) {
    // @witness keys() yields the stored elements, so the first key equals symbolic
    __IS_SAT__(s.keys().next().value !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
