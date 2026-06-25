// @type concolic
// @target es6+ Map.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  if (m.has(symbolic)) {
    // @witness keys() yields the stored keys, so the first equals symbolic
    __IS_SAT__(m.keys().next().value !== symbolic, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
