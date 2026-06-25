// @type concolic
// @target es6+ Map.prototype.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set("k", symbolic);
  if (m.has("k")) {
    // @witness the value stored under "k" is symbolic, so the first value equals symbolic
    __IS_SAT__(m.values().next().value !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
