// @type concolic
// @target es6+ Map.prototype.has
// @feature builtin has
// @done

function __test_symbolic__(symbolic) {
  var m = new Map();
  m.set(10, "a");
  if (m.has(symbolic)) {
    // @witness 10 is the only key, so has(symbolic) forces symbolic to be 10
    __IS_SAT__(symbolic !== 10, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 10));
