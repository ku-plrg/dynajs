// @type concolic
// @target es6+ Map.prototype.clear
// @feature builtin clear

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  m.clear();
  // @witness clear() empties the map, so has(symbolic) cannot hold afterward
  __IS_SAT__(m.has(symbolic), false);
}

__test_symbolic__(__symbolic__('s', 7));
