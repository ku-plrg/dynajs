// @type concolic
// @target es5 Array.prototype.filter
// @feature builtin filter
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.filter(function (v) { return v > 0; });
    // @witness filter returns a subsequence, so result length never exceeds the source length (2)
    __IS_SAT__(r.length > 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, -1]));
