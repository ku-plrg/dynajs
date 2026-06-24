// @type concolic
// @target es2019 Array.prototype.flatMap
// @feature builtin flatMap

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.flatMap(function (v) { return [v]; });
    // @witness each element maps to a single-element array, so flattening preserves length 2
    __IS_SAT__(r.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
