// @type concolic
// @target es6+ Map.prototype.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("k", symbolic);
  if (m.values().next().value === symbolic) {
    // @witness values() yields the stored value (symbolic), so the map is non-empty
    __IS_SAT__(m.size < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
