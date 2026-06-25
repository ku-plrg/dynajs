// @type concolic
// @target es6+ Array.prototype.copyWithin
// @feature builtin copyWithin
// @done

function __test_symbolic__(symbolic) {
  if (symbolic[1] === 7 && symbolic.copyWithin(0, 1).length === 3) {
    // @witness copyWithin(0,1) copies index 1 (pinned to 7) into index 0, so symbolic[0] becomes 7
    __IS_SAT__(symbolic[0] !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 7, 3]));
