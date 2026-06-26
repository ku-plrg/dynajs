// @type concolic
// @target es6+ Array.prototype.values
// @feature builtin values
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.values().next().value === 5) {
    // @witness values() yields elements in order, so the first equals symbolic[0]
    __IS_SAT__(symbolic[0] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
