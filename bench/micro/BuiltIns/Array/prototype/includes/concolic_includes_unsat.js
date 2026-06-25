// @type concolic
// @target es6+ Array.prototype.includes
// @feature builtin includes
// @done

function __test_symbolic__(symbolic) {

  if (symbolic[0] === 5) {
    // @witness element at index 0 is 5, so includes(5) is forced true
    __IS_SAT__(!(symbolic.includes(5)), false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', [5]));
