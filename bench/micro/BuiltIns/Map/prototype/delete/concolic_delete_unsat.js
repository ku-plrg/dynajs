// @type concolic
// @target es6+ Map.prototype.delete
// @feature builtin delete
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(symbolic, 1);
  if (m.delete(symbolic)) {
    // @witness delete(symbolic) returns true and removes the key, so has(symbolic) cannot hold afterward
    __IS_SAT__(m.has(symbolic), false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
