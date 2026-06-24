// @type concolic
// @target es6+ Array.prototype.at
// @feature builtin at
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.at(0) === 5) {
    // @witness at(0) reads index 0, which the guard pins to 5
    __IS_SAT__(symbolic[0] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
