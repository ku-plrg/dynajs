// @type concolic
// @target es6+ Map.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 5);
  if (m.entries().next().value[0] === symbolic) {
    // @witness the only entry is [symbolic, 5], so its value component is 5
    __IS_SAT__(m.entries().next().value[1] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
