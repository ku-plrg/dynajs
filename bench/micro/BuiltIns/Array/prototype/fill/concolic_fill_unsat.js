// @type concolic
// @target es6+ Array.prototype.fill
// @feature builtin fill

function __test_symbolic__(symbolic) {

  if (symbolic.length === 4) {
    symbolic.fill(9, 0, 4);
    // @witness fill(9,0,4) overwrites every index in [0,4), so index 1 must be 9
    __IS_SAT__(symbolic[1] !== 9, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', [0, 1, 2, 3]));
