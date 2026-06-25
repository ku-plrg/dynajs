// @type concolic
// @target es5 Array.prototype.every
// @feature builtin every
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic.every(function (v) { return v > 0; })) {
    // @witness every(v>0) holding means element 0 is also > 0, so <= 0 is impossible
    __IS_SAT__(symbolic[0] <= 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
