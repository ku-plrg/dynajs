// @type concolic
// @target es6+ Array.prototype.copyWithin
// @feature builtin copyWithin

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    symbolic.copyWithin(0, 1);
    // @witness copyWithin shifts elements in place and never changes the array length
    __IS_SAT__(symbolic.length !== 3, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
