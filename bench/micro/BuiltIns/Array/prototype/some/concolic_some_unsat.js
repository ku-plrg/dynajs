// @type concolic
// @target es5 Array.prototype.some
// @feature builtin some
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && !symbolic.some(function (v) { return v > 0; })) {
    // @witness no element is > 0 when some(v>0) is false, so element 0 cannot be > 0
    __IS_SAT__(symbolic[0] > 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [-1, -2]));
