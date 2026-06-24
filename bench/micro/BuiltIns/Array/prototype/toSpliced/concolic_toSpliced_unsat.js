// @type concolic
// @target es6+ Array.prototype.toSpliced
// @feature builtin toSpliced

function __test_symbolic__(symbolic) {
  if (symbolic.length === 3) {
    var r = symbolic.toSpliced(1, 1);
    // @witness toSpliced returns a copy with one element removed, so its length is 2
    __IS_SAT__(r.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2, 3]));
