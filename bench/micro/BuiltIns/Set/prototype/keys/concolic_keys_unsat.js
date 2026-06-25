// @type concolic
// @target es6+ Set.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  var s = new Set([symbolic]);
  if (s.keys().next().value === symbolic) {
    // @witness keys() yields the stored element, so a first key means the set is non-empty
    __IS_SAT__(s.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
