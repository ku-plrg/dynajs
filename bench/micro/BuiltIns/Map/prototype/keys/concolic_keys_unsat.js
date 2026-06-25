// @type concolic
// @target es6+ Map.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  if (m.keys().next().value === symbolic) {
    // @witness keys() yields the stored key (symbolic), so the map is non-empty
    __IS_SAT__(m.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
