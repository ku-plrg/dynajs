// @type concolic
// @target es6+ Array.prototype.with
// @feature builtin with
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.with(0, 5)[1] === 7) {
    // @witness with(0,5) changes only index 0, so result[1] equals symbolic[1]
    __IS_SAT__(symbolic[1] !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 7]));
