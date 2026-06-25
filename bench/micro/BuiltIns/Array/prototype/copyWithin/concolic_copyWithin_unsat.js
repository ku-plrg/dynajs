// @type concolic
// @target es6+ Array.prototype.copyWithin
// @feature builtin copyWithin
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3 && symbolic[1] === 7) {
    symbolic.copyWithin(0, 1);
    // @witness copyWithin(0, 1) copies index 1 into index 0, which the guard pins to 7
    __IS_SAT__(symbolic[0] !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 7, 3]));
