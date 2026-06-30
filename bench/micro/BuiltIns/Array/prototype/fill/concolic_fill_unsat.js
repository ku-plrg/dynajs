// @type concolic
// @target es6+ Array.prototype.fill
// @feature builtin fill
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.fill(9, 1, 3).length === 4) {
    // @witness fill(9,1,3) overwrites indices 1 and 2 with 9, so symbolic[1] becomes 9
    __IS_SAT__(symbolic[1] !== 9, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [0, 1, 2, 3]));
